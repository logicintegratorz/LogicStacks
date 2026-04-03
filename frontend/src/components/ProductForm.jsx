import React, { useState, useEffect } from 'react';

const ProductForm = ({ initialData, onSubmit, onCancel, categories, isEdit }) => {
    const [formData, setFormData] = useState({
        name: '', category_id: '', sku: '', supplier: '', party_price: '',
        is_consumable: 'false', description: '', base_unit: '', opening_quantity: '',
        opening_stock_price: '', average_consumption: '', min_days_required: '', average_delivery_days: '',
        location: '', ...initialData
    });

    const avgCons = parseFloat(formData.average_consumption) || 0;
    const minDays = parseFloat(formData.min_days_required) || 0;
    const delDays = parseFloat(formData.average_delivery_days) || 0;
    const computedMinStock = ((avgCons * minDays) + (avgCons * delDays)).toFixed(2);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-grid">
                <div>
                    <label>Product Name <span className="required-asterisk">*</span></label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Enter the product's official name or title</p>
                    <input name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Category <span className="required-asterisk">*</span></label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Select the main category or subcategory</p>
                    <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
                        <option value="">Select</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label>SKU</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Unique stock keeping unit code</p>
                    <input name="sku" value={formData.sku} onChange={handleInputChange} />
                </div>
                
                <div>
                    <label>Party/Supplier</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Select the supplier or party associated</p>
                    <input name="supplier" value={formData.supplier} onChange={handleInputChange} placeholder="Supplier Name" />
                </div>
                <div>
                    <label>Party Price</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Purchase price from the selected party/supplier</p>
                    <input type="number" step="0.01" name="party_price" value={formData.party_price} onChange={handleInputChange} />
                </div>
                <div>
                    <label>Is Consumable?</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Select 'Yes' if product is consumable</p>
                    <select name="is_consumable" value={formData.is_consumable} onChange={handleInputChange}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>
            </div>

            <div>
                <label>Product Description</label>
                <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Add details about product specifications or features</p>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
            </div>

            <div>
                <label>Product Store Location</label>
                <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Physical location in warehouse (e.g. Rack B3)</p>
                <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Store A1, Rack B3..." />
            </div>

            <div className="form-grid">
                <div>
                    <label>Base Unit</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Choose the primary measurement unit</p>
                    <select name="base_unit" value={formData.base_unit} onChange={handleInputChange}>
                        <option value="">Select Base Unit</option>
                        <option value="Piece">Piece</option>
                        <option value="Kg">Kg</option>
                        <option value="Liter">Liter</option>
                        <option value="Box">Box</option>
                    </select>
                </div>
                <div>
                    <label>Opening Quantity</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Initial quantity of product in stock</p>
                    <input type="number" name="opening_quantity" value={formData.opening_quantity} onChange={handleInputChange} />
                </div>
                <div>
                    <label>Opening Stock Price</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Purchase price per unit for opening balance</p>
                    <input type="number" step="0.01" name="opening_stock_price" value={formData.opening_stock_price} onChange={handleInputChange} />
                </div>

                <div>
                    <label>Average Consumption</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Average quantity consumed per day</p>
                    <input type="number" step="0.01" name="average_consumption" value={formData.average_consumption} onChange={handleInputChange} />
                </div>
                <div>
                    <label>Min Days Required</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Minimum number of days stock to maintain</p>
                    <input type="number" name="min_days_required" value={formData.min_days_required} onChange={handleInputChange} />
                </div>
                <div>
                    <label>Average Delivery Days</label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>Average days for delivery from supplier</p>
                    <input type="number" name="average_delivery_days" value={formData.average_delivery_days} onChange={handleInputChange} />
                </div>
                
                {/* AUTO CALCULATED FIELD */}
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Minimum Stock Quantity <span style={{fontSize: '10px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '12px'}}>Auto</span></label>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '0 0 8px 0' }}>(Avg Cons × Min Days) + (Avg Cons × Del Days)</p>
                    <input 
                        type="text" 
                        value={computedMinStock} 
                        readOnly 
                        disabled 
                        style={{ backgroundColor: '#edf2f7', cursor: 'not-allowed', fontWeight: 'bold' }}
                    />
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>{isEdit ? 'Update Product' : 'Save Product'}</button>
                {isEdit && (
                    <button type="button" className="btn-secondary" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel Edit</button>
                )}
            </div>
        </form>
    );
};

export default ProductForm;
