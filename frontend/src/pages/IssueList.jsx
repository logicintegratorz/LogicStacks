import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const IssueList = () => {
    const [analytics, setAnalytics] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [analyticsRes, issuesRes] = await Promise.all([
                    api.get('/issues/analytics'),
                    api.get('/issues')
                ]);
                setAnalytics(analyticsRes.data);
                setIssues(issuesRes.data);
            } catch (err) {
                setError('Failed to fetch analytics and issues lists.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div style={{ padding: '30px' }}>Loading Analytics Dashboard...</div>;
    if (error) return <div style={{ padding: '30px', color: '#e53e3e' }}>{error}</div>;

    const data = {
        labels: ['Today', 'This Week', 'Last 30 Days'],
        datasets: [
            {
                label: 'Total Amount (₹)',
                data: [
                    analytics?.today?.amount || 0,
                    analytics?.thisWeek?.amount || 0,
                    analytics?.last30Days?.amount || 0
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderRadius: 8,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#718096' }
            },
            title: {
                display: true,
                text: 'Total Amount by Time Period',
                color: '#4a5568',
                font: { size: 16 }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const index = context.dataIndex;
                        let qty = 0;
                        let amount = context.raw || 0;
                        if (index === 0) qty = analytics?.today?.qty || 0;
                        else if (index === 1) qty = analytics?.thisWeek?.qty || 0;
                        else if (index === 2) qty = analytics?.last30Days?.qty || 0;

                        const avgPrice = qty > 0 ? (amount / qty) : 0;

                        return [
                            `Total Amount: ₹${amount.toLocaleString()}`,
                            `Total Quantity: ${qty} items`,
                            `Average Price: ₹${avgPrice.toFixed(2)}`
                        ];
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#edf2f7' },
                ticks: { color: '#718096', callback: (value) => '₹' + value.toLocaleString() }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#718096' }
            }
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '20px' }}>
            {/* Chart Section */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                    <Bar data={data} options={options} />
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                { /* Today */ }
                <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'center', borderTop: '4px solid rgba(255, 99, 132, 0.8)' }}>
                    <h3 style={{ color: '#a0aec0', fontSize: '14px', margin: '0 0 15px 0' }}>Today</h3>
                    <div style={{ color: '#2b6cb0', fontSize: '24px', fontWeight: 'bold' }}>{analytics?.today?.qty || 0}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '10px' }}>items</div>
                    <div style={{ color: '#2b6cb0', fontSize: '28px', fontWeight: 'bold' }}>₹{parseFloat(analytics?.today?.amount || 0).toLocaleString()}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px' }}>total value</div>
                </div>
                { /* This Week */ }
                <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'center', borderTop: '4px solid rgba(54, 162, 235, 0.8)' }}>
                    <h3 style={{ color: '#a0aec0', fontSize: '14px', margin: '0 0 15px 0' }}>This Week</h3>
                    <div style={{ color: '#38a169', fontSize: '24px', fontWeight: 'bold' }}>{analytics?.thisWeek?.qty || 0}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '10px' }}>items</div>
                    <div style={{ color: '#38a169', fontSize: '28px', fontWeight: 'bold' }}>₹{parseFloat(analytics?.thisWeek?.amount || 0).toLocaleString()}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px' }}>total value</div>
                </div>
                { /* Last 30 Days */ }
                <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'center', borderTop: '4px solid rgba(75, 192, 192, 0.8)' }}>
                    <h3 style={{ color: '#a0aec0', fontSize: '14px', margin: '0 0 15px 0' }}>Last 30 Days</h3>
                    <div style={{ color: '#319795', fontSize: '24px', fontWeight: 'bold' }}>{analytics?.last30Days?.qty || 0}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '10px' }}>items</div>
                    <div style={{ color: '#319795', fontSize: '28px', fontWeight: 'bold' }}>₹{parseFloat(analytics?.last30Days?.amount || 0).toLocaleString()}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px' }}>total value</div>
                </div>
            </div>

            {/* Table Section */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#2d3748', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>Recent Issues List</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 12px', fontWeight: '600', color: '#4a5568' }}>Sr. No.</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', color: '#4a5568' }}>Product</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', color: '#4a5568' }}>Category</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', color: '#4a5568' }}>Issued Dept</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', color: '#4a5568' }}>Issue Date</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Qty</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Average Price</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>No issues recorded yet.</td>
                                </tr>
                            ) : (
                                issues.map((item, idx) => (
                                    <tr key={item.row_id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                                        <td style={{ padding: '16px 12px', color: '#718096', fontWeight: '500' }}>{idx + 1}</td>
                                        <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#2d3748' }}>{item.product_name}</td>
                                        <td style={{ padding: '16px 12px', color: '#718096' }}>{item.category_name || '-'}</td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <span style={{ backgroundColor: '#ebf8ff', color: '#3182ce', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {item.department_name}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 12px', color: '#718096' }}>
                                            {new Date(item.issue_date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', color: '#4a5568' }}>
                                            {item.issued_qty} Pcs
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', color: '#2b6cb0' }}>
                                            ₹{parseFloat(item.avg_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', color: '#38a169' }}>
                                            ₹{parseFloat(item.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

export default IssueList;
