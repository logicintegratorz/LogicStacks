import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const TAB_PENDING = 'pending';
const TAB_RECORDS = 'records';

const GateEntryList = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(TAB_PENDING);

  // Pending POs state
  const [pendingPOs, setPendingPOs] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // Gate entry records state
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterPoId, setFilterPoId] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const fetchPendingPOs = async () => {
    setPendingLoading(true);
    try {
      const res = await api.get('/gate-entry/pending');
      setPendingPOs(res.data || []);
    } catch {
      toast.error('Error fetching pending POs');
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get('/gate-entry/vendors');
      setVendors(res.data || []);
    } catch { /* ignore */ }
  };

  const fetchEntries = useCallback(async () => {
    setEntriesLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterVendor) params.append('vendorId', filterVendor);
      if (filterPoId) params.append('poId', filterPoId);
      if (filterDateFrom) params.append('dateFrom', filterDateFrom);
      if (filterDateTo) params.append('dateTo', filterDateTo);
      if (filterSearch) params.append('search', filterSearch);
      const res = await api.get(`/gate-entry?${params.toString()}`);
      setEntries(res.data || []);
    } catch {
      toast.error('Error fetching gate entry records');
    } finally {
      setEntriesLoading(false);
    }
  }, [filterStatus, filterVendor, filterPoId, filterDateFrom, filterDateTo, filterSearch]);

  useEffect(() => {
    fetchPendingPOs();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (tab === TAB_RECORDS) fetchEntries();
  }, [tab, fetchEntries]);

  const statusBadge = (status) => {
    const map = {
      'Ordered': { bg: '#3182ce', label: 'Ordered' },
      'Partially Received': { bg: '#ed8936', label: 'Partial' },
      'FULLY_RECEIVED': { bg: '#38a169', label: 'Fully Received' },
      'PARTIAL': { bg: '#ed8936', label: 'Partial' },
      'REJECTED': { bg: '#e53e3e', label: 'Rejected' },
    };
    const s = map[status] || { bg: '#718096', label: status };
    return <span style={{ display:'inline-flex', padding:'4px 10px', background:s.bg, color:'#fff', borderRadius:'12px', fontSize:'11px', fontWeight:'600' }}>{s.label}</span>;
  };

  const cellStyle = { padding: '14px 16px', fontSize: '13px', color: '#4a5568', borderBottom: '1px solid #edf2f7' };
  const thStyle = { padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', background: '#f7fafc', borderBottom: '1px solid #e2e8f0' };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>🚪 Gate Entry</h2>
          <p style={{ margin: '4px 0 0', color: '#a0aec0', fontSize: '13px' }}>Verify incoming goods & track completed receipts</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
        {[{ id: TAB_PENDING, label: `⏳ Pending POs (${pendingPOs.length})` }, { id: TAB_RECORDS, label: '📋 Gate Entry Records' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600',
            color: tab === t.id ? '#2b6cb0' : '#718096',
            borderBottom: tab === t.id ? '2px solid #2b6cb0' : '2px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB 1: PENDING POs ── */}
      {tab === TAB_PENDING && (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {pendingLoading ? (
            <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>Loading Pending POs...</p>
          ) : pendingPOs.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: '#a0aec0', fontSize: '15px' }}>✅ No approved POs pending gate verification.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>PO Details</th>
                    <th style={thStyle}>Vendor</th>
                    <th style={thStyle}>Total Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPOs.map((po, i) => (
                    <tr key={po.id} style={{ transition: 'background 0.15s' }}>
                      <td style={cellStyle}>{i + 1}</td>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 'bold', color: '#2b6cb0' }}>{po.po_number}</div>
                        <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '2px' }}>
                          {new Date(po.po_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={cellStyle}>{po.vendor_name}</td>
                      <td style={cellStyle}><span style={{ fontWeight: 'bold', color: '#2b6cb0' }}>₹ {Number(po.total_amount).toFixed(2)}</span></td>
                      <td style={cellStyle}>{statusBadge(po.status)}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <button
                          onClick={() => navigate('/gate-entry/verify', { state: { po } })}
                          style={{ padding: '8px 16px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                          Verify at Gate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: GATE ENTRY RECORDS ── */}
      {tab === TAB_RECORDS && (
        <>
          {/* Filters Bar */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#718096', display: 'block', marginBottom: '4px' }}>SEARCH</label>
              <input
                type="text" placeholder="PO # or vendor..."
                value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px', width: '160px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#718096', display: 'block', marginBottom: '4px' }}>STATUS</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
                <option value="">All</option>
                <option value="FULLY_RECEIVED">Fully Received</option>
                <option value="PARTIAL">Partial</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#718096', display: 'block', marginBottom: '4px' }}>VENDOR</label>
              <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }}>
                <option value="">All Vendors</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#718096', display: 'block', marginBottom: '4px' }}>FROM DATE</label>
              <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#718096', display: 'block', marginBottom: '4px' }}>TO DATE</label>
              <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '13px' }} />
            </div>
            <button onClick={fetchEntries}
              style={{ padding: '7px 16px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              Apply Filters
            </button>
            <button onClick={() => { setFilterStatus(''); setFilterVendor(''); setFilterPoId(''); setFilterDateFrom(''); setFilterDateTo(''); setFilterSearch(''); }}
              style={{ padding: '7px 14px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              Clear
            </button>
          </div>

          {/* Records Table */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {entriesLoading ? (
              <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>Loading records...</p>
            ) : entries.length === 0 ? (
              <p style={{ padding: '40px', textAlign: 'center', color: '#a0aec0', fontSize: '15px' }}>No gate entry records found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Gate ID</th>
                      <th style={thStyle}>PO Number</th>
                      <th style={thStyle}>Vendor</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Ordered Qty</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Received Qty</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Extra Qty</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Date & Time</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(e => {
                      let bg = 'transparent';
                      if (e.status === 'PARTIAL') bg = '#fff7ed';
                      if (e.status === 'FULLY_RECEIVED') bg = '#f0fdf4';
                      if (e.status === 'REJECTED') bg = '#fef2f2';
                      return (
                      <tr key={e.id} style={{ backgroundColor: bg }}>
                        <td style={cellStyle}><span style={{ fontWeight: '700', color: '#4a5568' }}>#{e.id}</span></td>
                        <td style={cellStyle}><span style={{ color: '#2b6cb0', fontWeight: '600' }}>{e.po_number}</span></td>
                        <td style={cellStyle}>{e.vendor_name}</td>
                        <td style={{ ...cellStyle, textAlign: 'right', fontWeight: '600' }}>{Number(e.total_ordered_qty).toFixed(0)}</td>
                        <td style={{ ...cellStyle, textAlign: 'right', fontWeight: '600', color: '#38a169' }}>{Number(e.total_received_qty).toFixed(0)}</td>
                        <td style={{ ...cellStyle, textAlign: 'right' }}>
                          {Number(e.total_extra_qty) > 0
                            ? <span style={{ fontWeight: '700', color: '#d69e2e', background: '#fffff0', border: '1px solid #f6e05e', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>+{Number(e.total_extra_qty).toFixed(0)}</span>
                            : <span style={{ color: '#a0aec0' }}>—</span>}
                        </td>
                        <td style={cellStyle}>{statusBadge(e.status)}</td>
                        <td style={cellStyle}>
                          <div style={{ fontSize: '12px' }}>{new Date(e.created_at).toLocaleDateString('en-GB')}</div>
                          <div style={{ fontSize: '11px', color: '#a0aec0' }}>{new Date(e.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td style={{ ...cellStyle, textAlign: 'center' }}>
                          <button
                            onClick={() => navigate(`/gate-entry/${e.id}`)}
                            style={{ padding: '6px 14px', background: '#ebf4ff', color: '#2b6cb0', border: '1px solid #bee3f8', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                            View
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GateEntryList;
