import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const styles = {
  container: {
    padding: '24px 30px',
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 65px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginBottom: '24px'
  },
  controlsSection: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '200px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568'
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fff'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    width: '80px',
    textAlign: 'center'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid #e2e8f0'
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff', padding: '24px', borderRadius: '8px',
    width: '500px', maxWidth: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }
};

const ReorderListing = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  // Filter states
  const [filterVendor, setFilterVendor] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVendorId, setModalVendorId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [productsRes, vendorsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products/reorder', { headers }),
        axios.get('http://localhost:5000/api/purchase-order/vendors', { headers })
      ]);

      setProducts(productsRes.data || []);
      setVendors(vendorsRes.data.data || []);
      
      const defaultQuantities = {};
      (productsRes.data || []).forEach(p => {
         defaultQuantities[p.id] = 1;
      });
      setQuantities(defaultQuantities);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load products or vendors');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (productId) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allSelected = {};
      filteredProducts.forEach(p => { allSelected[p.id] = true; });
      setSelectedItems(allSelected);
    } else {
      setSelectedItems({});
    }
  };

  const handleQuantityChange = (productId, val) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: val
    }));
  };

  const openModal = () => {
    const selectedProductIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    if (selectedProductIds.length === 0) {
      return toast.error('Please select at least one product');
    }
    setIsModalOpen(true);
  };

  const handleCreatePO = async () => {
    const selectedProductIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    
    if (!modalVendorId) {
      return toast.error('Please select a vendor for the Purchase Order');
    }

    try {
      const itemsToOrder = selectedProductIds.map(id => ({
        product_id: parseInt(id),
        quantity: quantities[id] || 1
      }));

      const token = localStorage.getItem('token');
      const payload = {
        vendor_id: parseInt(modalVendorId),
        items_with_qty: itemsToOrder
      };

      const res = await axios.post('http://localhost:5000/api/purchase-order/create-from-reorder', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Purchase Order Created!');
        setSelectedItems({});
        setIsModalOpen(false);
        navigate('/po/list');
      }
    } catch (error) {
      console.error('Error creating PO:', error);
      toast.error(error.response?.data?.message || 'Failed to create Purchase Order');
    }
  };

  const filteredProducts = products.filter(p => {
    if (filterVendor && String(p.preferred_vendor_id) !== filterVendor) return false;
    return true;
  });

  const areAllSelected = filteredProducts.length > 0 && Object.keys(selectedItems).filter(id => selectedItems[id]).length === filteredProducts.length;
  const hasSelection = Object.values(selectedItems).some(Boolean);

  if (loading) return <div style={styles.container}>Loading reorder items...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reorder Items</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.controlsSection}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Filter by Preferred Vendor</label>
            <select 
              style={styles.select}
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{...styles.formGroup, justifyContent: 'flex-end', flex: 1, alignItems: 'flex-end'}}>
             <button 
               style={{
                 ...styles.button,
                 ...(!hasSelection ? styles.buttonDisabled : {})
               }} 
               onClick={openModal}
               disabled={!hasSelection}
             >
               Add to P.O.
             </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '50px'}}>
                  <input 
                    type="checkbox" 
                    checked={areAllSelected} 
                    onChange={handleSelectAll} 
                  />
                </th>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Vendor</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Qty to Order</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyState}>No products found marked for reorder</td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const partyPrice = parseFloat(product.party_price || 0);
                  const lastPurchasePrice = parseFloat(product.last_purchase_price || 0);
                  const hasPriceMismatch = product.last_purchase_price !== null && partyPrice !== lastPurchasePrice;

                  return (
                  <tr key={product.id} style={{ backgroundColor: selectedItems[product.id] ? '#f0f9ff' : 'transparent' }}>
                    <td style={styles.td}>
                      <input 
                        type="checkbox" 
                        checked={!!selectedItems[product.id]}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td style={{...styles.td, fontWeight: '500'}}>{product.name}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {product.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td style={styles.td}>{product.sku || '-'}</td>
                    <td style={styles.td}>{product.preferred_vendor_name || '-'}</td>
                    <td style={{...styles.td, fontWeight: '500'}}>
                      ₹{partyPrice.toFixed(2)}
                      {hasPriceMismatch && (
                        <span title={`Mismatch! Last purchase price was ₹${lastPurchasePrice.toFixed(2)}`} style={{ marginLeft: '6px', color: '#e53e3e', fontSize: '16px', cursor: 'help' }}>🔴</span>
                      )}
                    </td>
                    <td style={styles.td}>
                       <input 
                          type="number"
                          min="1"
                          style={styles.input}
                          value={quantities[product.id] || 1}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                       />
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, fontSize: '20px', color: '#2d3748' }}>Create Purchase Order</h2>
            <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '20px' }}>
              You have selected {Object.values(selectedItems).filter(Boolean).length} items to reorder.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>
                Select PO Vendor <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <select 
                style={{ ...styles.select, width: '100%' }}
                value={modalVendorId}
                onChange={(e) => setModalVendorId(e.target.value)}
              >
                <option value="">-- Choose Vendor --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '10px 20px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#4a5568', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePO}
                style={styles.button}
              >
                Confirm & Create P.O.
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReorderListing;
