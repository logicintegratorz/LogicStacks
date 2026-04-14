import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const IndentAdd = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [indentDate, setIndentDate] = useState(today);
  const [remarks, setRemarks] = useState('');
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    { id: Date.now(), productId: '', unit: '', quantity: '' }
  ]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?limit=1000');
        if (response.data && response.data.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        toast.error('Error fetching products');
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    const newItems = [...items];
    newItems[index].productId = product ? product.id : '';
    newItems[index].unit = product ? product.base_unit || product.unit || 'Kilogram' : '';
    setItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const newItems = [...items];
    newItems[index].quantity = qty;
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { id: Date.now(), productId: '', unit: '', quantity: '' }]);
  };

  const removeRow = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!indentDate) {
      toast.error('Indent Date is required.');
      return;
    }
    if (new Date(indentDate) > new Date(today)) {
      toast.error('Indent Date cannot be a future date.');
      return;
    }
    
    const invalidItem = items.find(item => !item.productId || !item.quantity || Number(item.quantity) <= 0);
    if (invalidItem) {
      toast.error('Please select a product and enter a valid positive quantity for all rows.');
      return;
    }

    const payload = {
      indentDate,
      remarks,
      items: items.map(item => ({
        productId: item.productId,
        unit: item.unit,
        quantity: Number(item.quantity)
      }))
    };

    try {
      const response = await api.post('/indent', payload);
      
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Intent added successfully!');
        setIndentDate(today);
        setRemarks('');
        setItems([{ id: Date.now(), productId: '', unit: '', quantity: '' }]);
      } else {
        toast.error(response.data.message || 'Failed to add intent.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error. Please try again.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>Indent Add</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
          <div style={{ fontSize: '13px', color: '#4a5568', fontWeight: '500' }}>
            Home <span style={{ color: '#a0aec0', margin: '0 5px' }}>&rsaquo;</span> Generate Indent <span style={{ color: '#a0aec0', margin: '0 5px' }}>&rsaquo;</span> <span style={{ color: '#a0aec0' }}>Add</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 20px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              Dashboard
            </button>
            <button onClick={() => navigate('/indent/list')} style={{ padding: '8px 20px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              View Indents
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          
          <div style={{ marginBottom: '30px', width: '320px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568', fontSize: '14px' }}>
              Intend Date <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input 
              type="date" 
              max={today}
              value={indentDate}
              onChange={(e) => setIndentDate(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', color: '#4a5568', outline: 'none', fontSize: '14px' }}
            />
          </div>

          {/* Table Headers */}
          <div style={{ display: 'flex', gap: '15px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px', fontWeight: '600', color: '#4a5568', fontSize: '14px', width: '100%' }}>
            <div style={{ flex: '1' }}>Product Name</div>
            <div style={{ flex: '0 0 15%' }}>Unit</div>
            <div style={{ flex: '0 0 15%' }}>Qty</div>
            <div style={{ width: '100px', textAlign: 'right' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', width: '100%' }}>
            {items.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', width: '100%' }}>
                
                <div style={{ flex: '1' }}>
                  <select 
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    required
                    style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', background: '#fff', fontSize: '14px', color: '#4a5568' }}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ flex: '0 0 15%' }}>
                  <input 
                    type="text" 
                    value={item.unit}
                    readOnly
                    placeholder="Unit"
                    style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#edf2f7', color: '#718096', outline: 'none', cursor: 'not-allowed', fontSize: '14px' }}
                  />
                </div>
                
                <div style={{ flex: '0 0 15%' }}>
                  <input 
                    type="number" 
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    placeholder="123"
                    required
                    style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '14px', color: '#4a5568' }}
                  />
                </div>
                
                <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={addRow} style={{ background: '#ecc94b', color: '#fff', border: 'none', borderRadius: '6px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>
                    +
                  </button>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeRow(index)} style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px' }}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '30px', width: '100%' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568', fontSize: '14px' }}>Remarks</label>
            <textarea 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="3"
               style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', resize: 'vertical', fontSize: '14px', color: '#4a5568' }}
            />
          </div>

          <button type="submit" style={{ padding: '10px 20px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>✓</span> Add Intend
          </button>

        </form>
      </div>
    </div>
  );
};

export default IndentAdd;
