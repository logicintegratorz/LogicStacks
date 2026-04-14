import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const IndentList = () => {
  const navigate = useNavigate();
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('All');

  useEffect(() => {
    fetchIndents();
  }, []);

  const fetchIndents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/indent');
      if (response.data && response.data.success && response.data.data) {
        setIndents(response.data.data);
      }
    } catch (error) {
      toast.error('Error fetching indents');
      console.error('Error fetching indents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, currentStatus) => {
    const isWilling = window.confirm('Are you sure you really want to approve this intent?');
    if (!isWilling) return;

    try {
      const response = await api.put(`/indent/${id}/approve`, { approval_status: 'Approved' });
      if (response.data.success) {
        toast.success(response.data.message || 'Intent approved successfully');
        fetchIndents();
      } else {
        toast.error(response.data.message || 'Failed to approve');
      }
    } catch (error) {
       toast.error(error.response?.data?.message || 'Server error. Could not approve.');
    }
  };

  const handleReject = async (id) => {
    const isWilling = window.confirm('Are you sure you want to reject this intent?');
    if (!isWilling) return;

    try {
      const response = await api.put(`/indent/${id}/approve`, { approval_status: 'Rejected' });
      if (response.data.success) {
        toast.success(response.data.message || 'Intent rejected successfully');
        fetchIndents();
      } else {
        toast.error(response.data.message || 'Failed to reject');
      }
    } catch (error) {
       toast.error(error.response?.data?.message || 'Server error. Could not reject.');
    }
  };

  const handleComplete = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Complete' ? 'Incomplete' : 'Complete';
    const isWilling = window.confirm(`Are you sure you want to mark this intent as ${newStatus}?`);
    if (!isWilling) return;

    try {
      const response = await api.put(`/indent/${id}/complete`, { status: newStatus });
      if (response.data.success) {
        toast.success(response.data.message || `Intent marked as ${newStatus} successfully`);
        fetchIndents();
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
       toast.error(error.response?.data?.message || 'Server error. Could not update status.');
    }
  };

  // Safe filter mapping function
  const getFilteredIndents = () => {
    return indents.filter(indent => {
      if (statusFilter !== 'All' && indent.status !== statusFilter) return false;
      if (approvalFilter !== 'All' && indent.approval_status !== approvalFilter) return false;
      if (dateFilter) {
        const dObj = new Date(indent.indent_date);
        const filterStr = dObj.toISOString().split('T')[0];
        if (filterStr !== dateFilter) return false;
      }
      return true;
    });
  };

  const filteredIndents = getFilteredIndents();

  // Badges functions
  const getApprovalBadge = (status) => {
    let bg = '#ecc94b'; // Pending - Yellow
    if (status === 'Approved') bg = '#48bb78'; // Green
    if (status === 'Rejected') bg = '#e53e3e'; // Red
    return <span style={{ display: 'inline-flex', padding: '4px 10px', background: bg, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{status}</span>;
  };

  const getStatusBadge = (status) => {
    let bg = '#ed8936'; // Incomplete - Orange
    if (status === 'Complete') bg = '#48bb78'; // Green
    return <span style={{ display: 'inline-flex', padding: '4px 10px', background: bg, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{status}</span>;
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            Generate Intends
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#a0aec0', fontSize: '13px' }}>Manage and track all intends</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
             onClick={() => navigate('/indent/add')}
             style={{ padding: '10px 20px', background: '#f56565', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>+</span> Add Intend
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
              <option value="Incomplete">Incomplete</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
          
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '8px', textTransform: 'uppercase' }}>Intend Date</label>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '14px', color: '#4a5568', boxSizing: 'border-box' }}
            />
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
            <button onClick={() => { setStatusFilter('All'); setDateFilter(''); setApprovalFilter('All'); }} style={{ padding: '10px 15px', background: '#fff', color: '#a0aec0', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>Loading intends...</p>
        ) : filteredIndents.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>No Intends found.</p>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #edf2f7', background: '#f7fafc' }}>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>#</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Intend No.</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Items</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Approval</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Complete</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIndents.map((indent, index) => {
                  const itemsCount = indent.items ? indent.items.length : 0;
                  const dateObj = new Date(indent.indent_date);
                  const formattedIntendDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  
                  const createdObj = new Date(indent.created_at);
                  const formattedCreatedDate = createdObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

                  return (
                    <tr key={indent.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s', ':hover': { backgroundColor: '#f7fafc' } }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4a5568' }}>{index + 1}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4a5568', fontWeight: '500' }}>{indent.intend_no}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: '500', marginBottom: '4px' }}>Intend: {formattedIntendDate}</div>
                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>Created: {formattedCreatedDate}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-flex', padding: '4px 12px', background: '#e2e8f0', color: '#4a5568', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                          {itemsCount} items
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {getApprovalBadge(indent.approval_status)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {getStatusBadge(indent.status)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {indent.approval_status === 'Pending' && (
                            <>
                              <button onClick={() => handleApprove(indent.id)} style={{ padding: '4px 8px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Approve</button>
                              <button onClick={() => handleReject(indent.id)} style={{ padding: '4px 8px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Reject</button>
                            </>
                          )}
                          <button onClick={() => handleComplete(indent.id, indent.status)} style={{ padding: '4px 8px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                            {indent.status === 'Complete' ? 'Mark Incomplete' : 'Mark Complete'}
                          </button>
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

export default IndentList;
