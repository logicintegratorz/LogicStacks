import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const VendorAdd = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    tax_id_type: 'GST',
    gst_number: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    country: 'India',
    pin_code: '',
    contact_person: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (type) => {
    setFormData({ ...formData, tax_id_type: type, gst_number: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Party Name is required');
      return;
    }
    
    try {
      const response = await api.post('/vendors', formData);
      if (response.data.success) {
        toast.success(response.data.message || 'Party added successfully');
        navigate('/vendors');
      } else {
        toast.error(response.data.message || 'Failed to add party');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server Error. Could not add party.');
    }
  };

  // Indian States
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ];

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e0', color: '#4a5568', outline: 'none', fontSize: '14px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568', fontSize: '13px' };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Add Parties
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
             onClick={() => navigate('/vendors')}
             style={{ padding: '8px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
            View Parties
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 24px', marginBottom: '30px' }}>
            
            {/* ROW 1 */}
            <div>
              <label style={labelStyle}>Party Name <span style={{ color: '#e53e3e' }}>*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>
                <input type="radio" checked={formData.tax_id_type === 'GST'} onChange={() => handleRadioChange('GST')} style={{marginRight: '4px'}}/> GST No. 
                <input type="radio" checked={formData.tax_id_type === 'PAN'} onChange={() => handleRadioChange('PAN')} style={{marginLeft: '12px', marginRight: '4px'}}/> PAN No.
              </label>
              <input 
                type="text" 
                name="gst_number" 
                value={formData.gst_number} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder={`Enter ${formData.tax_id_type}`}
              />
            </div>

            <div>
              <label style={labelStyle}>E - mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>

            {/* ROW 2 */}
            <div>
              <label style={labelStyle}>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>State</label>
              <select name="state" value={formData.state} onChange={handleChange} style={{...inputStyle, background: '#fff'}}>
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Contact Person</label>
              <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Pin Code</label>
              <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} style={inputStyle} />
            </div>

            {/* ROW 3 */}
            <div>
              <label style={labelStyle}>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} style={inputStyle} />
            </div>

          </div>

          <div style={{ textAlign: 'right', marginTop: '40px' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              Add Party
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default VendorAdd;
