import React from 'react';

const ProductList = ({ products, onEdit, onDelete }) => {
    return (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #edf2f7' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8fafc', color: '#718096', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '16px 12px', fontWeight: '600' }}>#</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600' }}>Product</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600' }}>Category</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600' }}>Stock Qty</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600' }}>Last Price</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600' }}>Stock Value</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600', textAlign: 'center' }}>Avg Consumption</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600', textAlign: 'center' }}>Location</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600', textAlign: 'center' }}>Min Stock Reqd</th>
                        <th style={{ padding: '16px 12px', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr><td colSpan="10" style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>No products available</td></tr>
                    ) : (
                        products.map((p, index) => {
                            // Compute stock dynamically
                            const avgCons = parseFloat(p.average_consumption) || 0;
                            const minDays = parseFloat(p.min_days_required) || 0;
                            const delDays = parseFloat(p.average_delivery_days) || 0;
                            const computedMinStock = ((avgCons * minDays) + (avgCons * delDays));
                            
                            const isLow = p.opening_quantity < (computedMinStock || 5); 
                            const stockValue = (p.opening_quantity * (p.party_price || 0)).toFixed(2);
                            
                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '16px 12px', color: '#718096', fontWeight: '500' }}>{index + 1}</td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div style={{ color: '#4a5568', fontWeight: '600', textTransform: 'uppercase' }}>{p.name}</div>
                                        <div style={{ color: '#a0aec0', fontSize: '11px', marginTop: '4px' }}>SKU: {p.sku || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '16px 12px', color: '#718096' }}>{p.category_name}</td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: isLow ? '#fc8181' : '#48bb78', color: '#fff', padding: '4px 10px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {isLow ? '⚠️' : '✓'} {p.opening_quantity} {p.base_unit || 'Pcs'}
                                        </div>
                                        {isLow && <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '4px', textAlign: 'center', width: 'fit-content' }}>Min: {computedMinStock > 0 ? computedMinStock.toFixed(2) : 5}</div>}
                                    </td>
                                    <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#4a5568' }}>{p.party_price ? `₹ ${parseFloat(p.party_price).toLocaleString()}` : '-'}</td>
                                    <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#48bb78' }}>{stockValue > 0 ? `₹ ${parseFloat(stockValue).toLocaleString()}` : '-'}</td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', color: '#4a5568' }}>{p.average_consumption ? parseFloat(p.average_consumption).toFixed(2) : '-'}</td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', color: '#718096', fontSize: '12px' }}>{p.location || '-'}</td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', color: '#4a5568' }}>
                                        <div style={{ fontWeight: 'bold', color: '#2b6cb0' }}>
                                            {computedMinStock > 0 ? computedMinStock.toFixed(2) : '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => onEdit(p)} style={{ cursor: 'pointer', padding: '6px', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '4px', color: '#2b6cb0', display: 'flex', alignItems: 'center' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                            </button>
                                            <button onClick={() => onDelete(p.id)} style={{ cursor: 'pointer', padding: '6px', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '4px', color: '#e53e3e', display: 'flex', alignItems: 'center' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;
