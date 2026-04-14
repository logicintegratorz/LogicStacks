import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const POList = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('All');
  const [approvalFilter, setApprovalFilter] = useState('All');

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/purchase-order');
      if (response.data && response.data.success && response.data.data) {
        setPos(response.data.data);
      }
    } catch (error) {
      toast.error('Error fetching POs');
      console.error('Error fetching POs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, field, value) => {
    const isWilling = window.confirm(`Are you sure you want to change ${field} to ${value}?`);
    if (!isWilling) return;

    try {
      const response = await api.put(`/purchase-order/${id}/status`, { field, value });
      if (response.data.success) {
        toast.success(response.data.message || 'Status updated');
        fetchPOs();
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
       toast.error(error.response?.data?.message || 'Server error.');
    }
  };

  const getFilteredPOs = () => {
    return pos.filter(po => {
      if (statusFilter !== 'All' && po.status !== statusFilter) return false;
      if (approvalFilter !== 'All' && po.approval_status !== approvalFilter) return false;
      return true;
    });
  };

  const filteredPOs = getFilteredPOs();

  const getApprovalBadge = (status) => {
    let bg = '#ecc94b'; // Pending - Yellow
    if (status === 'Approved') bg = '#48bb78'; // Green
    if (status === 'Rejected') bg = '#e53e3e'; // Red
    return <span style={{ display: 'inline-flex', padding: '4px 10px', background: bg, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{status}</span>;
  };

  const getStatusBadge = (status) => {
    let bg = '#a0aec0'; // Draft - Gray
    if (status === 'Ordered') bg = '#3182ce'; // Blue
    if (status === 'Received') bg = '#48bb78'; // Green
    if (status === 'Cancelled') bg = '#e53e3e'; // Red
    return <span style={{ display: 'inline-flex', padding: '4px 10px', background: bg, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{status}</span>;
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Purchase Orders
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#a0aec0', fontSize: '13px' }}>Manage and track all POs</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
             onClick={() => navigate('/po/add')}
             style={{ padding: '10px 20px', background: '#f56565', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>+</span> Create PO
          </button>
          <button 
             onClick={() => navigate('/dashboard')}
             style={{ padding: '10px 20px', background: '#fff', color: '#3182ce', border: '1px solid #3182ce', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Dashboard
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Filters Section */}
        <div style={{ padding: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '8px', textTransform: 'uppercase' }}>Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', background: '#fff', fontSize: '14px', color: '#4a5568' }}
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Ordered">Ordered</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '8px', textTransform: 'uppercase' }}>Approval</label>
            <select 
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', background: '#fff', fontSize: '14px', color: '#4a5568' }}
            >
              <option value="All">All Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', minWidth: '200px' }}>
            <button onClick={() => { setStatusFilter('All'); setApprovalFilter('All'); }} style={{ padding: '10px 15px', background: '#fff', color: '#a0aec0', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>Loading POs...</p>
        ) : filteredPOs.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>No POs found.</p>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #edf2f7', background: '#f7fafc' }}>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>#</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>PO Details</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Vendor</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Approval</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map((po, index) => {
                  const dateObj = new Date(po.po_date);
                  const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                  return (
                    <tr key={po.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s', ':hover': { backgroundColor: '#f7fafc' } }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4a5568' }}>{index + 1}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: 'bold', marginBottom: '4px' }}>{po.po_number}</div>
                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>Date: {formattedDate}</div>
                        {po.intent_no && <div style={{ fontSize: '11px', color: '#3182ce', marginTop: '4px' }}>Intent: {po.intent_no}</div>}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4a5568', fontWeight: '500' }}>
                        {po.vendor_name}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2b6cb0' }}>₹ {Number(po.total_amount).toFixed(2)}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {getApprovalBadge(po.approval_status)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {getStatusBadge(po.status)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {po.approval_status === 'Pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(po.id, 'approval_status', 'Approved')} style={{ padding: '4px 8px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Approve</button>
                              <button onClick={() => handleUpdateStatus(po.id, 'approval_status', 'Rejected')} style={{ padding: '4px 8px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Reject</button>
                            </>
                          )}
                          {(po.approval_status === 'Approved' && po.status === 'Draft') && (
                            <button onClick={() => handleUpdateStatus(po.id, 'status', 'Ordered')} style={{ padding: '4px 8px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Order</button>
                          )}
                          {po.status === 'Ordered' && (
                            <button onClick={() => handleUpdateStatus(po.id, 'status', 'Received')} style={{ padding: '4px 8px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Mark Received</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default POList;
