import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const POAdd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reorderPOId = location.state?.reorderPOId;
  const today = new Date().toISOString().split('T')[0];

  const [poDate, setPoDate] = useState(today);
  const [parentPoId, setParentPoId] = useState(null);
  const [parentPoNumber, setParentPoNumber] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [vendors, setVendors] = useState([]);
  const [intents, setIntents] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [termsConditions, setTermsConditions] = useState('');

  const [items, setItems] = useState([
    { id: Date.now(), intentId: '', intentItemId: null, productId: '', nameLabel: '', quantity: '', unit: '', price: '', amount: 0 }
  ]);

  // Load essential dictionaries
  useEffect(() => {
    fetchVendors();
    fetchIntents();
    fetchProducts();
    if (reorderPOId) {
       fetchReorderData(reorderPOId);
    }
  }, [reorderPOId]);

  const fetchReorderData = async (id) => {
    try {
      const res = await api.get(`/purchase-order/${id}`);
      if (res.data.success) {
         const oldPo = res.data.data;
         setVendorId(String(oldPo.vendor_id)); // Use string for select box
         setRemarks(oldPo.remarks || '');
         setTermsConditions(oldPo.terms_conditions || '');
         setParentPoId(oldPo.id);
         setParentPoNumber(oldPo.po_number);
         
         if (oldPo.items && oldPo.items.length > 0) {
            const mappedItems = oldPo.items.map((item, idx) => ({
              id: Date.now() + idx,
              intentId: oldPo.intent_id ? String(oldPo.intent_id) : '',
              intentItemId: item.intent_item_id || null,
              productId: String(item.product_id),
              nameLabel: item.product_name,
              quantity: item.quantity,
              unit: item.unit,
              price: item.price,
              amount: item.amount
            }));
            setItems(mappedItems);
         }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load Reorder data');
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get('/purchase-order/vendors');
      if (res.data.success) setVendors(res.data.data);
    } catch(e) { console.error(e); }
  };

  const fetchIntents = async () => {
    try {
      // Fetch intents that have items (Completed or Incomplete, usually Approved ones in a real system)
      const res = await api.get('/indent');
      if (res.data.success) setIntents(res.data.data);
    } catch(e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=1000');
      if (res.data.products) setAllProducts(res.data.products);
    } catch(e) { console.error(e); }
  };

  // Helper to format date for Intent dropdown: "12 | Dt.: 29 Mar, 2026"
  const formatIntentLabel = (intent) => {
    const d = new Date(intent.indent_date);
    return `${intent.intend_no} | Dt.: ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const handleIntentSelect = (index, selectedIntentIdStr) => {
    const selectedIntentId = parseInt(selectedIntentIdStr, 10);
    const newItems = [...items];
    const row = newItems[index];

    row.intentId = selectedIntentIdStr; // Keep as string or int for select 
    row.intentItemId = null;
    row.productId = '';
    row.nameLabel = '';
    row.quantity = '';
    row.unit = '';
    row.price = '';
    row.amount = 0;

    // Auto-load logic: If this intent has items, we could auto-expand into multiple rows.
    // For simplicity matching the image where explicit UI dropdown is shown per row:
    // If an intent is selected, and it has EXACTLY 1 item, auto fill it. If more, require user to pick.
    if (selectedIntentId) {
      const intentObj = intents.find(i => i.id === selectedIntentId);
      if (intentObj && intentObj.items && intentObj.items.length === 1) {
        autoFillItem(row, intentObj.items[0]);
      } else if (intentObj && intentObj.items && intentObj.items.length > 1) {
        // Expand rows automatically for all intent items
        const subItems = intentObj.items;
        autoFillItem(row, subItems[0]); // Fill current row with first item
        
        // Push the rest as new rows
        for (let i = 1; i < subItems.length; i++) {
          const newRow = { id: Date.now() + i, intentId: selectedIntentIdStr, intentItemId: null, productId: '', nameLabel: '', quantity: '', unit: '', price: '', amount: 0 };
          autoFillItem(newRow, subItems[i]);
          newItems.push(newRow);
        }
      }
    }
    setItems(newItems);
  };

  const autoFillItem = (rowObj, intentItem) => {
    rowObj.intentItemId = intentItem.id;
    rowObj.productId = intentItem.product_id;
    rowObj.nameLabel = `${intentItem.product_name} | Qty: ${intentItem.quantity}`;
    rowObj.quantity = intentItem.quantity; // auto-suggest the requested intent qty
    rowObj.unit = intentItem.unit;
  };

  const handleManualProduct = (index, productIdStr) => {
    const productId = parseInt(productIdStr, 10);
    const p = allProducts.find(x => x.id === productId);
    const newItems = [...items];
    const row = newItems[index];

    row.intentId = '';
    row.intentItemId = null;
    row.productId = productIdStr;
    row.nameLabel = p ? p.name : '';
    row.unit = p ? p.base_unit || 'Unit' : '';
    setItems(newItems);
  };

  const calculateAmount = (row) => {
    const q = parseFloat(row.quantity) || 0;
    const p = parseFloat(row.price) || 0;
    row.amount = (q * p).toFixed(2);
  };

  const handleRowChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'price') {
      calculateAmount(newItems[index]);
    }
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { id: Date.now(), intentId: '', intentItemId: null, productId: '', nameLabel: '', quantity: '', unit: '', price: '', amount: 0 }]);
  };

  const removeRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendorId) return toast.error('Please select a vendor.');
    if (!poDate) return toast.error('PO Date is required.');
    
    // Check items
    const invalidItem = items.find(i => !i.productId || parseFloat(i.quantity) <= 0 || parseFloat(i.price) < 0);
    if (invalidItem) return toast.error('Check rows: select product, positive quantity, valid price.');

    // Derive po-level intentId
    const poIntentId = items.find(i => i.intentId)?.intentId || null;

    try {
      const payload = {
        intentId: poIntentId,
        vendorId,
        poDate,
        remarks,
        termsConditions,
        parentPoId,
        items: items.map(i => ({
          productId: i.productId,
          intentItemId: i.intentItemId || null,
          quantity: parseFloat(i.quantity),
          unit: i.unit,
          price: parseFloat(i.price)
        }))
      };

      const res = await api.post('/purchase-order', payload);
      if (res.data.success) {
        toast.success(res.data.message || 'PO generated successfully');
        navigate('/po/list');
      } else {
        toast.error(res.data.message);
      }
    } catch(error) {
      toast.error(error.response?.data?.message || 'Error saving PO');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>Add Purchase Order</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
          <div style={{ fontSize: '13px', color: '#4a5568', fontWeight: '500' }}>
            Home <span style={{ color: '#a0aec0', margin: '0 5px' }}>&rsaquo;</span> Purchase Order <span style={{ color: '#a0aec0', margin: '0 5px' }}>&rsaquo;</span> <span style={{ color: '#a0aec0' }}>Add</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 20px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Dashboard</button>
            <button onClick={() => navigate('/po/list')} style={{ padding: '8px 20px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>View POs</button>
          </div>
        </div>
      </div>
      
      {parentPoNumber && (
         <div style={{ background: '#ebf4ff', color: '#2b6cb0', padding: '10px 15px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', display: 'inline-block' }}>
            Reordered from {parentPoNumber}
         </div>
      )}

      <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            {/* Vendor */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568', fontSize: '14px' }}>Vendor <span style={{ color: '#e53e3e' }}>*</span></label>
              <select 
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff', outline: 'none', fontSize: '14px', color: '#4a5568' }}
              >
                <option value="">Select Vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            
            {/* PO Date */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568', fontSize: '14px' }}>PO Date <span style={{ color: '#e53e3e' }}>*</span></label>
              <input 
                type="date" 
                max={today}
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', color: '#4a5568', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2d3748', borderBottom: '2px solid #edf2f7', paddingBottom: '10px', marginBottom: '0' }}>Product Details</h3>
          
          {/* Table Headers */}
          <div style={{ display: 'flex', gap: '10px', padding: '12px 10px', background: '#dbeafe', fontWeight: 'bold', color: '#1e3a8a', fontSize: '13px', width: '100%', boxSizing: 'border-box', alignItems: 'center' }}>
            <div style={{ flex: '0 0 20%' }}>Intend No</div>
            <div style={{ flex: '1' }}>Item Name</div>
            <div style={{ flex: '0 0 10%' }}>Qty</div>
            <div style={{ flex: '0 0 10%' }}>Unit</div>
            <div style={{ flex: '0 0 10%' }}>Price</div>
            <div style={{ flex: '0 0 10%' }}>Amt</div>
            <div style={{ width: '80px', textAlign: 'center' }}>
              <button type="button" onClick={addRow} style={{ background: '#ecc94b', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>+</button>
            </div>
          </div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {items.map((row, index) => (
              <div key={row.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', padding: '10px 10px', borderBottom: '1px solid #edf2f7', boxSizing: 'border-box' }}>
                
                {/* Intend No Dropdown */}
                <div style={{ flex: '0 0 20%' }}>
                  <select 
                    value={row.intentId}
                    onChange={(e) => handleIntentSelect(index, e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff', outline: 'none', fontSize: '13px', color: '#4a5568' }}
                  >
                    <option value="">-- Manual Item --</option>
                    {intents.map(i => <option key={i.id} value={i.id}>{formatIntentLabel(i)}</option>)}
                  </select>
                </div>
                
                {/* Item Name */}
                <div style={{ flex: '1' }}>
                  {row.intentId ? (
                    <input 
                      type="text" 
                      value={row.nameLabel} 
                      readOnly 
                      style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#718096', fontSize: '13px', outline: 'none' }}
                    />
                  ) : (
                    <select 
                      value={row.productId}
                      onChange={(e) => handleManualProduct(index, e.target.value)}
                      required
                      style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff', outline: 'none', fontSize: '13px', color: '#4a5568' }}
                    >
                      <option value="">-- Select Product --</option>
                      {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
                
                {/* Qty */}
                <div style={{ flex: '0 0 10%' }}>
                  <input 
                    type="number" 
                    min="0.01" step="0.01"
                    value={row.quantity}
                    onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                    required
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                
                {/* Unit */}
                <div style={{ flex: '0 0 10%' }}>
                  <input 
                    type="text" 
                    value={row.unit}
                    readOnly
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#718096', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                
                {/* Price */}
                <div style={{ flex: '0 0 10%' }}>
                  <input 
                    type="number" 
                    min="0" step="0.01"
                    value={row.price}
                    onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                    required
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Amount */}
                <div style={{ flex: '0 0 10%' }}>
                  <input 
                    type="text" 
                    value={row.amount}
                    readOnly
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#4a5568', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }}
                  />
                </div>

                {/* Actions */}
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <button type="button" onClick={() => removeRow(index)} style={{ background: '#f56565', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right', padding: '20px 10px', fontSize: '18px', fontWeight: 'bold', color: '#2d3748' }}>
            Total Amount: <span style={{ color: '#2b6cb0' }}>₹ {totalAmount.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px', width: '100%' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568', fontSize: '14px' }}>Remarks</label>
              <textarea 
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="2"
                 style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', resize: 'vertical', fontSize: '14px', color: '#4a5568' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568', fontSize: '14px' }}>Terms & Conditions:</label>
              <textarea 
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                rows="3"
                 style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', resize: 'vertical', fontSize: '14px', color: '#4a5568' }}
              />
            </div>
          </div>

          <button type="submit" style={{ padding: '12px 25px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>✓</span> Save Purchase Order
          </button>

        </form>
      </div>
    </div>
  );
};

export default POAdd;
