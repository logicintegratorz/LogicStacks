import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductList from '../components/ProductList';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Using navigate for explicit routing
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const pRes = await api.get(`/products?page=${currentPage}&limit=${limit}`);
            setProducts(pRes.data.products || []);
            setTotalProducts(pRes.data.total || 0);
            setTotalPages(pRes.data.totalPages || 1);
            setError('');
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        // Navigate explicitly to the dedicated edit route using the product ID
        navigate(`/products/edit/${product.id}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            await api.delete(`/products/${id}`);
            await fetchData();
            setSuccess('Product deleted completely.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product');
        }
    };

    if (loading && products.length === 0) return <div style={{ padding: '30px' }}>Loading interface...</div>;

    return (
        <div className="animate-fade-in" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            {error && <div style={{ color: '#c53030', backgroundColor: '#fed7d7', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
            {success && <div style={{ color: '#2f855a', backgroundColor: '#c6f6d5', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}

            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b6cb0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        <h3 style={{ margin: 0, color: '#2d3748', fontSize: '18px', fontWeight: 'bold' }}>Products List</h3>
                        <span style={{ backgroundColor: '#2b6cb0', color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>{totalProducts} Items</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '12px', color: '#a0aec0' }}>
                            Showing {products.length > 0 ? (currentPage - 1) * limit + 1 : 0} to {Math.min(currentPage * limit, totalProducts)} of {totalProducts} products
                        </span>
                        <button 
                            onClick={() => navigate('/products/add')}
                            style={{ padding: '8px 16px', backgroundColor: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Product
                        </button>
                    </div>
                </div>
                
                <ProductList 
                    products={products}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            style={{ padding: '6px 12px', backgroundColor: currentPage === 1 ? '#edf2f7' : '#fff', color: currentPage === 1 ? '#a0aec0' : '#4a5568', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '500' }}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '14px', color: '#4a5568', fontWeight: '500' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            style={{ padding: '6px 12px', backgroundColor: currentPage === totalPages ? '#edf2f7' : '#fff', color: currentPage === totalPages ? '#a0aec0' : '#4a5568', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: '500' }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
