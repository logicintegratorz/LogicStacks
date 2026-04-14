import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/Modal';

const POList = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('All');
  const [approvalFilter, setApprovalFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  const handleView = async (id) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const response = await api.get(`/purchase-order/${id}`);
      if (response.data && response.data.success) {
        setSelectedPO(response.data.data);
      } else {
         toast.error('Failed to load PO details');
         setIsModalOpen(false);
      }
    } catch (err) {
      toast.error('Server error fetching PO');
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
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
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                          
                          {/* View Button */}
                          <button onClick={() => handleView(po.id)} title="View PO Details" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #c6f6d5', background: '#f0fff4', color: '#38a169', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>

                          {po.approval_status === 'Pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(po.id, 'approval_status', 'Approved')} title="Approve" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#48bb78', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                              </button>
                              <button onClick={() => handleUpdateStatus(po.id, 'approval_status', 'Rejected')} title="Reject" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #fed7d7', background: '#f56565', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </>
                          )}
                          {(po.approval_status === 'Approved' && po.status === 'Draft') && (
                            <button onClick={() => handleUpdateStatus(po.id, 'status', 'Ordered')} style={{ padding: '6px 10px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>Order</button>
                          )}
                          {po.status === 'Ordered' && (
                            <button onClick={() => handleUpdateStatus(po.id, 'status', 'Received')} style={{ padding: '6px 10px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>Mark Received</button>
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

      {/* PO View Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Purchase Order Details" maxWidth="750px">
        {modalLoading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>Loading PO Details...</p>
        ) : selectedPO ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f7fafc', padding: '16px', borderRadius: '8px' }}>
              <div><span style={{color: '#a0aec0', fontSize: '12px', display: 'block'}}>PO Number</span><div style={{fontWeight: 600, color: '#2b6cb0', fontSize: '15px'}}>{selectedPO.po_number}</div></div>
              <div style={{textAlign: 'right'}}><span style={{color: '#a0aec0', fontSize: '12px', display: 'block'}}>Date</span><div style={{fontWeight: 600, color: '#2d3748', fontSize: '15px'}}>{new Date(selectedPO.po_date).toLocaleDateString('en-GB')}</div></div>
              <div><span style={{color: '#a0aec0', fontSize: '12px', display: 'block'}}>Vendor</span><div style={{fontWeight: 600, color: '#2d3748', fontSize: '15px'}}>{selectedPO.vendor_name}</div></div>
              <div style={{textAlign: 'right'}}><span style={{color: '#a0aec0', fontSize: '12px', display: 'block'}}>Status</span><div style={{fontWeight: 600, color: '#2d3748', fontSize: '15px'}}>{selectedPO.status}</div></div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #edf2f7', background: '#f7fafc' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Item Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Quantity</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Rate</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(selectedPO.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#2d3748', fontWeight: 500 }}>{item.product_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568', textAlign: 'right' }}>{Number(item.quantity).toFixed(2)} {item.unit}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568', textAlign: 'right' }}>₹{Number(item.price).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568', textAlign: 'right' }}>₹{Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold', color: '#2d3748', textAlign: 'right' }}>Total Amount:</td>
                  <td style={{ padding: '12px 16px', fontSize: '15px', fontWeight: 'bold', color: '#2b6cb0', textAlign: 'right' }}>₹{Number(selectedPO.total_amount).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </Modal>

    </div>
  );
};

export default POList;
