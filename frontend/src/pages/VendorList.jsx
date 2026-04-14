import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/Modal';

const VendorList = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendors');
      if (response.data && response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      toast.error('Error fetching parties');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this party?')) return;
    try {
      const res = await api.delete(`/vendors/${id}`);
      if (res.data.success) {
        toast.success('Party deleted successfully');
        fetchVendors();
      } else {
        toast.error(res.data.message);
      }
    } catch(err) {
      toast.error('Server error deleting party');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>Parties List</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
             onClick={() => navigate('/vendors/add')}
             style={{ padding: '8px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
            + Add Party
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', width: '100%' }}>
        {loading ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>Loading Parties...</p>
        ) : vendors.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>No Parties found.</p>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #edf2f7', background: '#f7fafc' }}>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Sr. No.</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Party Details</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>State</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v, index) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #edf2f7', ':hover': { backgroundColor: '#f7fafc' } }}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4a5568' }}>{index + 1}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: '600' }}>{v.name}</div>
                      <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                        {v.tax_id_type}: {v.gst_number || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '13px', color: '#4a5568' }}>{v.phone || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>{v.email || '-'}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#4a5568' }}>
                      {v.state || '-'}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleView(v)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #c6f6d5', background: '#f0fff4', color: '#38a169', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button onClick={() => handleDelete(v.id)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #fed7d7', background: '#fff5f5', color: '#e53e3e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Party Details">
        {selectedVendor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><span style={{color: '#a0aec0', fontSize: '12px'}}>Name</span><div style={{fontWeight: 600, color: '#2d3748'}}>{selectedVendor.name}</div></div>
              <div><span style={{color: '#a0aec0', fontSize: '12px'}}>{selectedVendor.tax_id_type}</span><div style={{fontWeight: 600, color: '#2d3748'}}>{selectedVendor.gst_number || '-'}</div></div>
              <div><span style={{color: '#a0aec0', fontSize: '12px'}}>Phone</span><div style={{color: '#4a5568'}}>{selectedVendor.phone || '-'}</div></div>
              <div><span style={{color: '#a0aec0', fontSize: '12px'}}>Email</span><div style={{color: '#4a5568'}}>{selectedVendor.email || '-'}</div></div>
              <div style={{gridColumn: '1 / span 2'}}><span style={{color: '#a0aec0', fontSize: '12px'}}>Address</span><div style={{color: '#4a5568'}}>{selectedVendor.address || '-'}</div></div>
              <div><span style={{color: '#a0aec0', fontSize: '12px'}}>State</span><div style={{color: '#4a5568'}}>{selectedVendor.state || '-'}</div></div>
              <div><span style={{color: '#a0aec0', fontSize: '12px'}}>Pin Code</span><div style={{color: '#4a5568'}}>{selectedVendor.pin_code || '-'}</div></div>
              <div><span style={{color: '#a0aec0', fontSize: '12px'}}>Country</span><div style={{color: '#4a5568'}}>{selectedVendor.country || '-'}</div></div>
              <div><span style={{color: '#a0aec0', fontSize: '12px'}}>Contact Person</span><div style={{color: '#4a5568'}}>{selectedVendor.contact_person || '-'}</div></div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default VendorList;
