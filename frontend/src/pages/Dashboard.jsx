import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0, lowStockItems: [], totalInventoryValue: 0, totalInventoryItems: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/products/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading Analytics...</div>;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '28px', color: '#1a202c', marginBottom: '30px' }}>Inventory Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="metric-card gradient-blue">
                    <h3 style={{ color: '#4a5568', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Total Products Listed</h3>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#2b6cb0', margin: 0 }}>{stats.totalProducts}</p>
                </div>
                <div className="metric-card gradient-green">
                    <h3 style={{ color: '#4a5568', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Total Est. Value</h3>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#38a169', margin: 0 }}>₹ {stats.totalInventoryValue.toLocaleString()}</p>
                </div>
                <div className="metric-card gradient-purple">
                    <h3 style={{ color: '#4a5568', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Total Physical Items</h3>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#805ad5', margin: 0 }}>{stats.totalInventoryItems.toLocaleString()}</p>
                </div>
                <div className="metric-card gradient-red">
                    <h3 style={{ color: '#4a5568', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Low Stock Warnings</h3>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: stats.lowStockItems.length > 0 ? '#e53e3e' : '#718096', margin: 0 }}>{stats.lowStockItems.length}</p>
                </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#2d3748' }}>Items Requiring Action (Stock {'<'} 5)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '12px' }}>Product Identifier</th>
                            <th style={{ padding: '12px' }}>Quantity Left</th>
                            <th style={{ padding: '12px' }}>Stock Alert Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.lowStockItems.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>All stock levels are optimal.</td></tr>
                        ) : (
                            stats.lowStockItems.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{item.name}</td>
                                    <td style={{ padding: '12px', color: '#e53e3e', fontWeight: 'bold' }}>{item.opening_quantity}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Reorder Needed</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
