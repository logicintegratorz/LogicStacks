import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const GateEntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await api.get(`/gate-entry/${id}`);
        setEntry(res.data);
      } catch {
        toast.error('Failed to load gate entry details');
        navigate('/gate-entry');
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id, navigate]);

  const statusConfig = {
    FULLY_RECEIVED: { bg: '#38a169', label: 'Fully Received' },
    PARTIAL: { bg: '#ed8936', label: 'Partial' },
    REJECTED: { bg: '#e53e3e', label: 'Rejected' },
  };

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ color: '#a0aec0', fontSize: '15px' }}>Loading gate entry details...</div>
    </div>
  );

  if (!entry) return null;

  const items = entry.items || [];
  const sc = statusConfig[entry.status] || { bg: '#718096', label: entry.status };

  const totalOrdered = items.reduce((s, i) => s + Number(i.ordered_quantity || 0), 0);
  const totalReceived = items.reduce((s, i) => s + Number(i.received_quantity || 0), 0);
  const totalExtra = items.reduce((s, i) => s + Number(i.extra_quantity || 0), 0);
  const totalValue = items.reduce((s, i) => s + Number(i.total_price || 0), 0);

  const thStyle = { padding: '10px 14px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', background: '#f7fafc', borderBottom: '1px solid #e2e8f0' };
  const tdStyle = { padding: '12px 14px', fontSize: '13px', color: '#4a5568', borderBottom: '1px solid #edf2f7' };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Gate Entry #{entry.id}
            <span style={{ display: 'inline-flex', padding: '4px 12px', background: sc.bg, color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{sc.label}</span>
          </h2>
          <p style={{ margin: '4px 0 0', color: '#a0aec0', fontSize: '13px' }}>
            {new Date(entry.created_at).toLocaleString('en-GB')} · PO: {entry.po_number} · {entry.vendor_name}
          </p>
        </div>
        <button onClick={() => navigate('/gate-entry')}
          style={{ padding: '10px 20px', background: '#fff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          ← Back to List
        </button>
      </div>

      {/* PO + Gatekeeper Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#4a5568', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purchase Order Details</h3>
          {[
            ['PO Number', entry.po_number],
            ['PO Date', new Date(entry.po_date).toLocaleDateString('en-GB')],
            ['Vendor', entry.vendor_name],
            ['Received Date', new Date(entry.received_date).toLocaleDateString('en-GB')],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
              <span style={{ color: '#718096' }}>{label}</span>
              <span style={{ fontWeight: '600', color: '#2d3748' }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#4a5568', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receipt Summary</h3>
          {[
            ['Gatekeeper', entry.gatekeeper_name || '—'],
            ['Total Ordered Qty', totalOrdered.toFixed(0)],
            ['Total Received Qty', totalReceived.toFixed(0)],
            ['Total Extra Qty', totalExtra > 0 ? `+${totalExtra.toFixed(0)} ⚠️` : '—'],
            ['Total Receipt Value', `₹ ${totalValue.toFixed(2)}`],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
              <span style={{ color: '#718096' }}>{label}</span>
              <span style={{ fontWeight: '600', color: label.includes('Extra') && totalExtra > 0 ? '#d69e2e' : '#2d3748' }}>{val}</span>
            </div>
          ))}
          {entry.remarks && (
            <div style={{ marginTop: '12px', padding: '10px', background: '#f7fafc', borderRadius: '6px', fontSize: '12px', color: '#718096' }}>
              <strong>Remarks:</strong> {entry.remarks}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#2d3748' }}>Product-wise Breakdown</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Ordered Qty</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Received Qty</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Extra Qty</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Unit Price</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const extra = Number(item.extra_quantity || 0);
                return (
                  <tr key={item.id} style={{ background: extra > 0 ? '#fffff0' : '#fff' }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: '500' }}>{item.product_name}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>{Number(item.ordered_quantity).toFixed(0)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#38a169', fontWeight: '600' }}>{Number(item.received_quantity).toFixed(0)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {extra > 0
                        ? <span style={{ fontWeight: '700', color: '#d69e2e', background: '#fffff0', border: '1px solid #f6e05e', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>+{extra.toFixed(0)}</span>
                        : <span style={{ color: '#a0aec0' }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>₹ {Number(item.unit_price).toFixed(2)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600', color: '#2b6cb0' }}>₹ {Number(item.total_price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f7fafc', borderTop: '2px solid #e2e8f0' }}>
                <td style={{ ...tdStyle, fontWeight: '700', color: '#2d3748' }}>TOTALS</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700' }}>{totalOrdered.toFixed(0)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', color: '#38a169' }}>{totalReceived.toFixed(0)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', color: totalExtra > 0 ? '#d69e2e' : '#a0aec0' }}>
                  {totalExtra > 0 ? `+${totalExtra.toFixed(0)}` : '—'}
                </td>
                <td style={tdStyle}>—</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '700', color: '#2b6cb0' }}>₹ {totalValue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GateEntryDetail;
