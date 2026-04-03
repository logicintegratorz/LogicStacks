import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            setError('Failed to fetch categories');
        }
        setLoading(false);
    };

    const handleEdit = (cat) => {
        setEditId(cat.id);
        const mappedData = { ...cat };
        if (mappedData.description === null) mappedData.description = '';
        setFormData(mappedData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (editId) {
                await api.put(`/categories/${editId}`, formData);
                setSuccess('Category updated successfully!');
            } else {
                await api.post('/categories', formData);
                setSuccess('Category assigned successfully!');
            }
            setEditId(null);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deleting a category is permanent. Continue?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete category (it may be in use by products).');
        }
    };

    if (loading) return <div>Loading categories...</div>;

    return (
        <div className="animate-fade-in" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            
            {/* Form Section */}
            <div>
                <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#2d3748' }}>Manage Categories</h2>
                
                {error && <div style={{ color: '#c53030', backgroundColor: '#fed7d7', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
                {success && <div style={{ color: '#2f855a', backgroundColor: '#c6f6d5', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label>Category Name <span className="required-asterisk">*</span></label>
                        <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>The unique identifier for a family of products</p>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Optional Description</label>
                        <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Details surrounding this product family</p>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="4"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button type="submit" className="btn-primary">{editId ? 'Update Category' : 'Create Category'}</button>
                        {editId && (
                            <button type="button" className="btn-secondary" onClick={() => {
                                setEditId(null);
                                setFormData({ name: '', description: '' });
                            }}>Cancel Edit</button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div>
                 <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#2d3748' }}>Active Categories</h2>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Description</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Total Products</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{cat.name}</td>
                                <td style={{ padding: '12px', color: '#718096' }}>{cat.description || '-'}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{ backgroundColor: '#edf2f7', color: '#4a5568', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {cat.product_count || 0} Listed
                                    </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleEdit(cat)} style={{ cursor: 'pointer', padding: '6px', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '4px', color: '#2b6cb0', display: 'flex', alignItems: 'center' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} style={{ cursor: 'pointer', padding: '6px', backgroundColor: '#fff', border: '1px solid #cbd5e0', borderRadius: '4px', color: '#e53e3e', display: 'flex', alignItems: 'center' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Categories;
