import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const GateEntryList = () => {
  const navigate = useNavigate();
  const [pendingPOs, setPendingPOs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPOs();
  }, []);

  const fetchPendingPOs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gate-entry/pending');
      if (response.data) {
        setPendingPOs(response.data);
      }
    } catch (error) {
      toast.error('Error fetching pending POs for Gate Entry');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    let bg = '#3182ce'; // Ordered - Blue
    if (status === 'Partially Received') bg = '#ecc94b'; // Yellow
    return <span style={{ display: 'inline-flex', padding: '4px 10px', background: bg, color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{status}</span>;
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Gate Entry Verification
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#a0aec0', fontSize: '13px' }}>Verify arriving goods against approved Purchase Orders</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', width: '100%', boxSizing: 'border-box' }}>
        {/* Table Section */}
        {loading ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>Loading Pending POs...</p>
        ) : pendingPOs.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>No Approved POs pending for Gate Verify.</p>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #edf2f7', background: '#f7fafc' }}>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>#</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>PO Details</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Vendor</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Total Amount</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPOs.map((po, index) => {
                  const dateObj = new Date(po.po_date);
                  const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                  return (
                    <tr key={po.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s', ':hover': { backgroundColor: '#f7fafc' } }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4a5568' }}>{index + 1}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: 'bold', marginBottom: '4px' }}>{po.po_number}</div>
                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>Date: {formattedDate}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4a5568', fontWeight: '500' }}>
                        {po.vendor_name}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2b6cb0' }}>₹ {Number(po.total_amount).toFixed(2)}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {getStatusBadge(po.status)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                         <button 
                            onClick={() => navigate('/gate-entry/verify', { state: { po } })}
                            style={{ padding: '8px 14px', background: '#48bb78', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                           Verify at Gate
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
    </div>
  );
};

export default GateEntryList;
