import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
import { downloadPDF } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COMPANY_NAME = 'Your Company Name';
const COMPANY_ADDRESS = 'Address Line 1, City, State | Phone: +91 XXXXXXXXXX';

const IssueList = () => {
  const [analytics, setAnalytics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // Filter state
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Fetch reference lists on mount
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [cRes, dRes, pRes] = await Promise.all([
          api.get('/categories'),
          api.get('/departments'),
          api.get('/products?limit=1000'),
        ]);
        setCategories(cRes.data || []);
        setDepartments(dRes.data?.data || dRes.data || []);
        setProducts(pRes.data?.products || []);
      } catch (_) {}
    };
    fetchRefs();
  }, []);

  // Fetch issues whenever filters change
  useEffect(() => {
    fetchData();
  }, [filterCategory, filterDept, filterProduct, filterDateFrom, filterDateTo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category_id', filterCategory);
      if (filterDept) params.append('department_id', filterDept);
      if (filterProduct) params.append('product_id', filterProduct);
      if (filterDateFrom) params.append('date_from', filterDateFrom);
      if (filterDateTo) params.append('date_to', filterDateTo);

      const [analyticsRes, issuesRes] = await Promise.all([
        api.get('/issues/analytics'),
        api.get(`/issues?${params.toString()}`)
      ]);
      setAnalytics(analyticsRes.data);
      setIssues(issuesRes.data);
    } catch (err) {
      setError('Failed to fetch issue data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterDept('');
    setFilterProduct('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    await downloadPDF('issue-report-content', `Issue-List-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    setPdfLoading(false);
  };

  const handlePrint = () => window.print();

  const totalIssued = issues.reduce((s, i) => s + Number(i.issued_qty), 0);
  const totalAmount = issues.reduce((s, i) => s + Number(i.total_amount), 0);

  const chartData = {
    labels: ['Today', 'This Week', 'Last 30 Days'],
    datasets: [{
      label: 'Total Amount (₹)',
      data: [analytics?.today?.amount || 0, analytics?.thisWeek?.amount || 0, analytics?.last30Days?.amount || 0],
      backgroundColor: ['rgba(255,99,132,0.8)', 'rgba(54,162,235,0.8)', 'rgba(75,192,192,0.8)'],
      borderRadius: 8,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#718096' } },
      title: { display: true, text: 'Total Amount by Time Period', color: '#4a5568', font: { size: 16 } },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            let qty = [analytics?.today?.qty, analytics?.thisWeek?.qty, analytics?.last30Days?.qty][index] || 0;
            let amount = context.raw || 0;
            return [`Total Amount: ₹${amount.toLocaleString()}`, `Total Qty: ${qty}`, `Avg Price: ₹${qty > 0 ? (amount / qty).toFixed(2) : '0.00'}`];
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#edf2f7' }, ticks: { color: '#718096', callback: v => '₹' + v.toLocaleString() } },
      x: { grid: { display: false }, ticks: { color: '#718096' } }
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#2d3748' }}>Issue List</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} style={{ padding: '8px 16px', background: '#fff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🖨️ Print</button>
          <button onClick={handleDownloadPDF} disabled={pdfLoading} style={{ padding: '8px 16px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            {pdfLoading ? 'Generating...' : '📄 Download PDF'}
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1', minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '6px', textTransform: 'uppercase' }}>Category</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', color: '#4a5568', outline: 'none' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '6px', textTransform: 'uppercase' }}>Department</label>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', color: '#4a5568', outline: 'none' }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.department_id || d.id} value={d.department_id || d.id}>{d.department_name || d.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '6px', textTransform: 'uppercase' }}>Product</label>
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', color: '#4a5568', outline: 'none' }}>
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '6px', textTransform: 'uppercase' }}>Date From</label>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', color: '#4a5568', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: '1', minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '6px', textTransform: 'uppercase' }}>Date To</label>
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', color: '#4a5568', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <button onClick={handleClearFilters} style={{ padding: '9px 16px', background: '#edf2f7', color: '#718096', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', alignSelf: 'flex-end' }}>Clear</button>
      </div>

      {/* All content captured for PDF */}
      <div id="issue-report-content">

        {/* Letterhead (only visible in PDF/print) */}
        <div className="print-letterhead" style={{ display: 'none', textAlign: 'center', borderBottom: '2px solid #2d3748', paddingBottom: '12px', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#2d3748' }}>{COMPANY_NAME}</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#718096' }}>{COMPANY_ADDRESS}</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#4a5568' }}>ISSUE LIST REPORT</h2>
        </div>

        {/* Chart */}
        {!loading && analytics && (
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <div style={{ height: '280px', display: 'flex', justifyContent: 'center' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Summary cards */}
        {!loading && analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            {[
              { label: 'Today', qty: analytics?.today?.qty, amount: analytics?.today?.amount, color: 'rgba(255,99,132,0.8)' },
              { label: 'This Week', qty: analytics?.thisWeek?.qty, amount: analytics?.thisWeek?.amount, color: 'rgba(54,162,235,0.8)' },
              { label: 'Last 30 Days', qty: analytics?.last30Days?.qty, amount: analytics?.last30Days?.amount, color: 'rgba(75,192,192,0.8)' },
            ].map(card => (
              <div key={card.label} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'center', borderTop: `4px solid ${card.color}` }}>
                <h3 style={{ color: '#a0aec0', fontSize: '14px', margin: '0 0 15px 0' }}>{card.label}</h3>
                <div style={{ color: '#2b6cb0', fontSize: '24px', fontWeight: 'bold' }}>{card.qty || 0}</div>
                <div style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '10px' }}>items</div>
                <div style={{ color: '#2b6cb0', fontSize: '24px', fontWeight: 'bold' }}>₹{parseFloat(card.amount || 0).toLocaleString()}</div>
                <div style={{ color: '#cbd5e1', fontSize: '12px' }}>total value</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#2d3748', fontSize: '18px', margin: 0, fontWeight: 'bold' }}>
              Issue Records {issues.length > 0 && <span style={{ fontSize: '13px', color: '#718096', fontWeight: '400' }}>({issues.length} records)</span>}
            </h3>
            {issues.length > 0 && (
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#4a5568' }}>
                <span><strong>{totalIssued}</strong> total units</span>
                <span><strong>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> total value</span>
              </div>
            )}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#718096', padding: '30px' }}>Loading...</p>
          ) : error ? (
            <p style={{ textAlign: 'center', color: '#e53e3e', padding: '20px' }}>{error}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 12px', fontWeight: '600', color: '#4a5568' }}>Sr.</th>
                    <th style={{ padding: '14px 12px', fontWeight: '600', color: '#4a5568' }}>Product</th>
                    <th style={{ padding: '14px 12px', fontWeight: '600', color: '#4a5568' }}>Category</th>
                    <th style={{ padding: '14px 12px', fontWeight: '600', color: '#4a5568' }}>Dept / Person</th>
                    <th style={{ padding: '14px 12px', fontWeight: '600', color: '#4a5568' }}>Issue Date</th>
                    <th style={{ padding: '14px 12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '14px 12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Avg Price</th>
                    <th style={{ padding: '14px 12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Total Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.length === 0 ? (
                    <tr><td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>No issues recorded for the selected filters.</td></tr>
                  ) : (
                    issues.map((item, idx) => (
                      <tr key={item.row_id} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '14px 12px', color: '#718096' }}>{idx + 1}</td>
                        <td style={{ padding: '14px 12px', fontWeight: 'bold', color: '#2d3748' }}>{item.product_name}</td>
                        <td style={{ padding: '14px 12px', color: '#718096' }}>{item.category_name || '-'}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ backgroundColor: '#ebf8ff', color: '#3182ce', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' }}>{item.department_name || '-'}</span>
                          {item.person_name && <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginTop: '4px' }}>👤 {item.person_name}</div>}
                        </td>
                        <td style={{ padding: '14px 12px', color: '#718096' }}>{new Date(item.issue_date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 'bold', color: '#4a5568' }}>{item.issued_qty}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 'bold', color: '#2b6cb0' }}>₹{parseFloat(item.avg_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 'bold', color: '#38a169' }}>₹{parseFloat(item.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {issues.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e2e8f0', backgroundColor: '#f7fafc' }}>
                      <td colSpan="5" style={{ padding: '14px 12px', fontWeight: 'bold', color: '#2d3748' }}>Total</td>
                      <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 'bold', color: '#4a5568' }}>{totalIssued}</td>
                      <td style={{ padding: '14px 12px' }}></td>
                      <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 'bold', color: '#38a169', fontSize: '15px' }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .print-letterhead { display: block !important; }
          nav, aside, header, button { display: none !important; }
          body { font-size: 12px; }
        }
      `}</style>
    </div>
  );
};

export default IssueList;
