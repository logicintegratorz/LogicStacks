import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { downloadPDF } from '../utils/pdfGenerator';

const COMPANY_NAME = 'Your Company Name';
const COMPANY_ADDRESS = 'Address Line 1, City, State | Phone: +91 XXXXXXXXXX';

const IndentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => { fetchIndents(); }, []);

  const fetchIndents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/indent');
      if (response.data?.success && response.data?.data) {
        setIndents(response.data.data);
      }
    } catch (error) {
      toast.error('Error fetching indents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this intent?')) return;
    try {
      const response = await api.put(`/indent/${id}/approve`, { approval_status: 'Approved' });
      if (response.data.success) { toast.success('Intent approved'); fetchIndents(); }
      else toast.error(response.data.message || 'Failed to approve');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this intent?')) return;
    try {
      const response = await api.put(`/indent/${id}/approve`, { approval_status: 'Rejected' });
      if (response.data.success) { toast.success('Intent rejected'); fetchIndents(); }
      else toast.error(response.data.message || 'Failed to reject');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  // Undo Complete toggle — this function is preserved exactly as original
  const handleComplete = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Complete' ? 'Incomplete' : 'Complete';
    if (!window.confirm(`Are you sure you want to mark this intent as ${newStatus}?`)) return;
    try {
      const response = await api.put(`/indent/${id}/complete`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Intent marked as ${newStatus}`);
        fetchIndents();
      } else toast.error(response.data.message || 'Failed to update status');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this intent?')) return;
    try {
      const response = await api.delete(`/indent/${id}`);
      if (response.data.success) { toast.success('Intent deleted'); fetchIndents(); }
      else toast.error(response.data.message || 'Failed to delete');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Can only delete Pending intents');
    }
  };

  const getFilteredIndents = () => indents.filter(indent => {
    if (statusFilter !== 'All' && indent.status !== statusFilter) return false;
    if (approvalFilter !== 'All' && indent.approval_status !== approvalFilter) return false;
    if (dateFilter) {
      const filterStr = new Date(indent.indent_date).toISOString().split('T')[0];
      if (filterStr !== dateFilter) return false;
    }
    return true;
  });

  const filteredIndents = getFilteredIndents();

  const getApprovalBadge = (status) => {
    let bg = '#ecc94b';
    if (status === 'Approved') bg = '#48bb78';
    if (status === 'Rejected') bg = '#e53e3e';
    return <span style={{ display: 'inline-flex', padding: '4px 10px', background: bg, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{status}</span>;
  };

  const getStatusBadge = (status) => {
    const bg = status === 'Complete' ? '#48bb78' : '#ed8936';
    return <span style={{ display: 'inline-flex', padding: '4px 10px', background: bg, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{status}</span>;
  };

  const handleView = (indent) => { setSelectedIndent(indent); setIsModalOpen(true); };

  const handleDownloadPDF = async () => {
    if (!selectedIndent) return;
    setPdfLoading(true);
    await downloadPDF('indent-pdf-content', `Indent-${selectedIndent.intend_no}.pdf`);
    setPdfLoading(false);
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>

      {/* Print-only letterhead (hidden on screen) */}
      <div id="print-letterhead" style={{ display: 'none' }} className="print-only">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #2d3748', paddingBottom: '12px', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', color: '#2d3748' }}>{COMPANY_NAME}</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#718096' }}>{COMPANY_ADDRESS}</p>
          <h2 style={{ margin: '12px 0 0 0', fontSize: '16px', color: '#4a5568' }}>INTENDS LIST REPORT</h2>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>Generate Intends</h2>
          <p style={{ margin: '5px 0 0 0', color: '#a0aec0', fontSize: '13px' }}>Manage and track all intends</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} style={{ padding: '10px 16px', background: '#fff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🖨️ Print</button>
          <button onClick={() => navigate('/indent/add')} style={{ padding: '10px 20px', background: '#f56565', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>+ Add Intend</button>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', background: '#fff', color: '#3182ce', border: '1px solid #3182ce', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Dashboard</button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', width: '100%', boxSizing: 'border-box' }}>
        {/* Filters */}
        <div style={{ padding: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '8px', textTransform: 'uppercase' }}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', background: '#fff', fontSize: '14px', color: '#4a5568' }}>
              <option value="All">All Status</option>
              <option value="Incomplete">Incomplete</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '8px', textTransform: 'uppercase' }}>Intend Date</label>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', fontSize: '14px', color: '#4a5568', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#a0aec0', marginBottom: '8px', textTransform: 'uppercase' }}>Approval</label>
            <select value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', background: '#fff', fontSize: '14px', color: '#4a5568' }}>
              <option value="All">All Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', minWidth: '140px' }}>
            <button onClick={() => { setStatusFilter('All'); setDateFilter(''); setApprovalFilter('All'); }} style={{ padding: '10px 15px', background: '#fff', color: '#a0aec0', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Clear</button>
          </div>
        </div>

        {/* Table */}
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
                  const formattedIntendDate = new Date(indent.indent_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formattedCreatedDate = new Date(indent.created_at).toLocaleDateString('en-GB').replace(/\//g, '-');

                  return (
                    <tr key={indent.id} style={{ borderBottom: '1px solid #edf2f7' }}>
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
                      <td style={{ padding: '16px 20px' }}>{getApprovalBadge(indent.approval_status)}</td>
                      <td style={{ padding: '16px 20px' }}>{getStatusBadge(indent.status)}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>

                          {/* View */}
                          <button onClick={() => handleView(indent)} title="View" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #c6f6d5', background: '#f0fff4', color: '#38a169', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>

                          {/* Edit & Delete — Pending only */}
                          {indent.approval_status === 'Pending' && (
                            <>
                              <button onClick={() => navigate('/indent/add', { state: { editIndentId: indent.id } })} title="Edit" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #fefcbf', background: '#fefcbf', color: '#b7791f', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                ✏️
                              </button>
                              <button onClick={() => handleDelete(indent.id)} title="Delete" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #fed7d7', background: '#fff5f5', color: '#e53e3e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                🗑️
                              </button>
                            </>
                          )}

                          {/* Approve/Reject — Pending only */}
                          {indent.approval_status === 'Pending' && (
                            <>
                              <button onClick={() => handleApprove(indent.id)} title="Approve" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#48bb78', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"></path></svg>
                              </button>
                              <button onClick={() => handleReject(indent.id)} title="Reject" style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #fed7d7', background: '#f56565', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </>
                          )}

                          {/* Complete / Undo Complete — ONLY after Approved */}
                          {indent.approval_status === 'Approved' && (
                            <button onClick={() => handleComplete(indent.id, indent.status)} title={indent.status === 'Complete' ? 'Undo Complete' : 'Mark Complete'} style={{ padding: '6px 10px', background: indent.status === 'Complete' ? '#718096' : '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                              {indent.status === 'Complete' ? 'Undo Complete' : 'Complete'}
                            </button>
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

      {/* View Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Intend Details" maxWidth="700px">
        {selectedIndent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* PDF-printable content */}
            <div id="indent-pdf-content" style={{ padding: '16px', background: '#fff' }}>
              {/* Letterhead */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #2d3748', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#2d3748' }}>{COMPANY_NAME}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#718096' }}>{COMPANY_ADDRESS}</p>
                <h3 style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#4a5568', letterSpacing: '1px' }}>INDENT / MATERIAL REQUISITION</h3>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f7fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div><span style={{ color: '#a0aec0', fontSize: '12px', display: 'block' }}>Req. No.</span><div style={{ fontWeight: 600, color: '#2d3748', fontSize: '15px' }}>{selectedIndent.intend_no}</div></div>
                <div style={{ textAlign: 'right' }}><span style={{ color: '#a0aec0', fontSize: '12px', display: 'block' }}>Date</span><div style={{ fontWeight: 600, color: '#2d3748', fontSize: '15px' }}>{new Date(selectedIndent.indent_date).toLocaleDateString('en-GB')}</div></div>
                <div><span style={{ color: '#a0aec0', fontSize: '12px', display: 'block' }}>Approval Status</span><div style={{ fontWeight: 600, color: '#2d3748', fontSize: '15px' }}>{selectedIndent.approval_status}</div></div>
                <div style={{ textAlign: 'right' }}><span style={{ color: '#a0aec0', fontSize: '12px', display: 'block' }}>Status</span><div style={{ fontWeight: 600, color: '#2d3748', fontSize: '15px' }}>{selectedIndent.status}</div></div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #edf2f7', background: '#f7fafc' }}>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Sr. No.</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Item Description</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>Unit</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#4a5568', textAlign: 'right' }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedIndent.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#2d3748', fontWeight: 500 }}>{item.product_name || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568' }}>{item.unit || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4a5568', textAlign: 'right' }}>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', color: '#718096' }}>Requested By: ___________</div>
                <div style={{ fontSize: '12px', color: '#718096' }}>Authorized By: ___________</div>
              </div>
            </div>

            {/* Modal action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
              <button onClick={handleDownloadPDF} disabled={pdfLoading} style={{ padding: '8px 18px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                {pdfLoading ? 'Generating...' : '📄 Download PDF'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-letterhead, #print-letterhead * { visibility: visible; display: block !important; }
          .print-only { display: block !important; }
          nav, aside, header, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default IndentList;
