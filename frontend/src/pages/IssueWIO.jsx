import React, { useState, useEffect } from 'react';
import api from '../services/api';

const IssueWIO = () => {
    const [products, setProducts] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    // Each row represents an item being issued.
    const emptyRow = { id: Date.now(), product_id: '', issued_qty: '', department_id: '', person_name: '', remarks: '' };
    const [rows, setRows] = useState([{ ...emptyRow }]);
    
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch products (limit=1000 or similar to get all for dropdown, or handle explicitly)
                const pRes = await api.get('/products?page=1&limit=1000');
                setProducts(pRes.data.products || []);
                
                const dRes = await api.get('/departments');
                setDepartments(dRes.data || []);
            } catch (err) {
                setError('Failed to fetch product or department data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleAddRow = () => {
        setRows([...rows, { ...emptyRow, id: Date.now() }]);
    };

    const handleRemoveRow = (id) => {
        if (rows.length > 1) {
            setRows(rows.filter(r => r.id !== id));
        }
    };

    const handleRowChange = (id, field, value) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const getAvailableStock = (productId) => {
        if (!productId) return 0;
        const prod = products.find(p => String(p.id) === String(productId));
        return prod ? prod.opening_quantity : 0;
    };
    
    const getBaseUnit = (productId) => {
        if (!productId) return '';
        const prod = products.find(p => String(p.id) === String(productId));
        return prod && prod.base_unit ? prod.base_unit : 'Pcs';
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        // Validation
        const itemsToSubmit = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 1;
            
            if (!row.product_id) return setError(`Row ${rowNum}: Please select a product.`);
            if (!row.department_id && !row.person_name) return setError(`Row ${rowNum}: Please select a Department OR enter a Person Name.`);
            
            const qty = parseInt(row.issued_qty);
            if (isNaN(qty) || qty <= 0) return setError(`Row ${rowNum}: Quantity must be greater than 0.`);
            
            const available = getAvailableStock(row.product_id);
            if (qty > available) return setError(`Row ${rowNum}: Cannot issue more than available stock (${available}).`);
            
            itemsToSubmit.push({
                product_id: row.product_id,
                department_id: row.department_id,
                person_name: row.person_name,
                issued_qty: qty,
                remarks: row.remarks
            });
        }

        try {
            setSubmitLoading(true);
            const res = await api.post('/issues', { items: itemsToSubmit });
            setSuccess(`Success: ${res.data.message} (Issue ID: #IS${res.data.issue_id})`);
            
            // Deduct stock locally or re-fetch products to reflect updated numbers
            const pRes = await api.get('/products?page=1&limit=1000');
            setProducts(pRes.data.products || []);
            
            // Reset rows
            setRows([{ ...emptyRow }]);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit issue. Transaction rolled back.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '30px' }}>Loading form...</div>;

    return (
        <div className="animate-fade-in" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                Issue Item W/O Request
            </h2>

            {error && <div style={{ color: '#c53030', backgroundColor: '#fed7d7', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
            {success && <div style={{ color: '#2f855a', backgroundColor: '#c6f6d5', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px', width: '60px' }}>Sr. No.</th>
                        <th style={{ padding: '12px', width: '250px' }}>Product Code</th>
                        <th style={{ padding: '12px', width: '120px' }}>Product Qty.</th>
                        <th style={{ padding: '12px', width: '120px' }}>Available</th>
                        <th style={{ padding: '12px', width: '200px' }}>Department</th>
                        <th style={{ padding: '12px', width: '200px' }}>Person Name</th>
                        <th style={{ padding: '12px' }}>Remarks</th>
                        <th style={{ padding: '12px', width: '60px', textAlign: 'center' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => {
                        const available = getAvailableStock(row.product_id);
                        const unit = getBaseUnit(row.product_id);
                        
                        return (
                        <tr key={row.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                            <td style={{ padding: '16px 12px', color: '#4a5568' }}>{index + 1}</td>
                            <td style={{ padding: '12px' }}>
                                <select 
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                    value={row.product_id}
                                    onChange={e => handleRowChange(row.id, 'product_id', e.target.value)}
                                >
                                    <option value="">Select Product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} {p.sku ? `| Code: ${p.sku}` : ''}</option>
                                    ))}
                                </select>
                            </td>
                            <td style={{ padding: '12px' }}>
                                <input 
                                    type="number"
                                    min="1"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                    value={row.issued_qty}
                                    onChange={e => handleRowChange(row.id, 'issued_qty', e.target.value)}
                                    placeholder="Qty"
                                />
                            </td>
                            <td style={{ padding: '12px', fontWeight: 'bold', color: available > 0 ? '#48bb78' : '#e53e3e' }}>
                                {row.product_id ? `${available} ${unit}` : '-'}
                            </td>
                            <td style={{ padding: '12px' }}>
                                <select 
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                    value={row.department_id}
                                    onChange={e => handleRowChange(row.id, 'department_id', e.target.value)}
                                >
                                    <option value="">Select Department...</option>
                                    {departments.map(d => (
                                        <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                                    ))}
                                </select>
                            </td>
                            <td style={{ padding: '12px' }}>
                                <input 
                                    type="text"
                                    maxLength="150"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                    value={row.person_name}
                                    onChange={e => handleRowChange(row.id, 'person_name', e.target.value)}
                                    placeholder="Enter Name"
                                />
                            </td>
                            <td style={{ padding: '12px' }}>
                                <input 
                                    type="text"
                                    maxLength="100"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                    value={row.remarks}
                                    onChange={e => handleRowChange(row.id, 'remarks', e.target.value)}
                                    placeholder="Remarks (Optional) 100 characters max."
                                />
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button onClick={handleAddRow} style={{ width: '30px', height: '30px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        +
                                    </button>
                                    {rows.length > 1 && (
                                        <button onClick={() => handleRemoveRow(row.id)} style={{ width: '30px', height: '30px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            -
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>

            <div style={{ marginTop: '20px' }}>
                <button 
                    onClick={handleSubmit} 
                    disabled={submitLoading}
                    style={{ padding: '12px 24px', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', cursor: submitLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                    {submitLoading ? 'Processing...' : 'Issue Item'}
                </button>
            </div>
        </div>
    );
};

export default IssueWIO;
