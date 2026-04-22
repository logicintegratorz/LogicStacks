import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductForm from '../components/ProductForm';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setLoading(true);

        // Fetch categories and vendors in parallel
        const [cRes, vRes] = await Promise.all([
          api.get('/categories'),
          api.get('/vendors')
        ]);
        setCategories(cRes.data);
        // Handle both {success, data:[]} and plain [] responses
        setVendors(vRes.data?.data || vRes.data || []);

        if (id) {
          const pRes = await api.get(`/products/${id}`);
          const mappedData = { ...pRes.data };
          mappedData.is_consumable = mappedData.is_consumable ? 'true' : 'false';
          mappedData.is_reorder = mappedData.is_reorder ? 'true' : 'false';
          Object.keys(mappedData).forEach(key => {
            if (mappedData[key] === null) mappedData[key] = '';
          });
          setInitialData(mappedData);
        } else {
          setInitialData(null);
        }
      } catch (err) {
        setError('Failed to fetch required data. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [id]);

  const handleCancel = () => navigate('/products');

  const handleSubmit = async (formData) => {
    setError('');
    setSuccess('');

    const payload = {
      ...formData,
      opening_quantity: parseInt(formData.opening_quantity) || 0,
      opening_stock_price: formData.opening_stock_price ? parseFloat(formData.opening_stock_price) : null,
      average_consumption: formData.average_consumption ? parseFloat(formData.average_consumption) : null,
      min_days_required: formData.min_days_required ? parseInt(formData.min_days_required) : null,
      average_delivery_days: formData.average_delivery_days ? parseInt(formData.average_delivery_days) : null,
      location: formData.location || null,
      is_consumable: formData.is_consumable === 'true',
      is_reorder: formData.is_reorder === 'true',
      preferred_vendor_id: formData.preferred_vendor_id ? parseInt(formData.preferred_vendor_id) : null,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
    };

    try {
      if (id) {
        await api.put(`/products/${id}`, payload);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        setSuccess('Product successfully created!');
      }
      setTimeout(() => navigate('/products'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  if (loading) return <div style={{ padding: '30px' }}>Loading form...</div>;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        {id ? 'Edit Product' : 'Add New Product'}
      </h2>

      {error && <div style={{ color: '#c53030', backgroundColor: '#fed7d7', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
      {success && <div style={{ color: '#2f855a', backgroundColor: '#c6f6d5', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}

      <ProductForm
        key={id ? `edit-${id}` : 'new-product-form'}
        initialData={initialData}
        categories={categories}
        vendors={vendors}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={!!id}
      />
    </div>
  );
};

export default ProductFormPage;
