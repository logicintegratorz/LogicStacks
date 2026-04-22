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
    minWidth: '250px'
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
  }
};

const ReorderListing = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Reorder products and Vendors in parallel
      const [productsRes, vendorsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products/reorder', { headers }),
        axios.get('http://localhost:5000/api/purchase-order/vendors', { headers })
      ]);

      setProducts(productsRes.data);
      setVendors(vendorsRes.data.data || []);
      
      const defaultQuantities = {};
      productsRes.data.forEach(p => {
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
      products.forEach(p => { allSelected[p.id] = true; });
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

  const handleCreatePO = async () => {
    const selectedProductIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    
    if (selectedProductIds.length === 0) {
      return toast.error('Please select at least one product');
    }
    if (!selectedVendor) {
      return toast.error('Please select a vendor');
    }

    try {
      const itemsToOrder = selectedProductIds.map(id => ({
        product_id: parseInt(id),
        quantity: quantities[id] || 1
      }));

      const token = localStorage.getItem('token');
      const payload = {
        vendor_id: parseInt(selectedVendor),
        items_with_qty: itemsToOrder
      };

      const res = await axios.post('http://localhost:5000/api/purchase-order/create-from-reorder', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Purchase Order Created!');
        // Deselect items
        setSelectedItems({});
        // Redirect to PO list
        navigate('/po/list');
      }
    } catch (error) {
      console.error('Error creating PO:', error);
      toast.error(error.response?.data?.message || 'Failed to create Purchase Order');
    }
  };

  const areAllSelected = products.length > 0 && Object.keys(selectedItems).filter(id => selectedItems[id]).length === products.length;

  if (loading) return <div style={styles.container}>Loading reorder items...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reorder Items</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.controlsSection}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Vendor</label>
            <select 
              style={styles.select}
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              <option value="">-- Select Vendor --</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          
          <div style={{...styles.formGroup, justifyContent: 'flex-end'}}>
             <button 
               style={{
                 ...styles.button,
                 ...(Object.values(selectedItems).some(Boolean) ? {} : styles.buttonDisabled)
               }} 
               onClick={handleCreatePO}
               disabled={!Object.values(selectedItems).some(Boolean)}
             >
               Add to Purchase Order
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
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Qty to Order</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyState}>No products found marked for reorder</td>
                </tr>
              ) : (
                products.map((product) => (
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
                    <td style={{...styles.td, fontWeight: '500'}}>${parseFloat(product.party_price || 0).toFixed(2)}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReorderListing;
