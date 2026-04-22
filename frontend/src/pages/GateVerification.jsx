import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const GateVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPO = location.state?.po;

  const [po, setPO] = useState(initialPO || null);
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(!initialPO);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialPO) {
      toast.error('No PO selected for verification.');
      navigate('/gate-entry');
      return;
    }

    const initializedItems = (initialPO.items || []).map(item => {
      const ordered = Number(item.quantity) || 0;
      const alreadyReceived = Number(item.received_quantity) || 0;
      const outstanding = Math.max(0, ordered - alreadyReceived);
      return {
        ...item,
        ordered_quantity: ordered,
        already_received: alreadyReceived,
        outstanding_quantity: outstanding,
        received_quantity: outstanding,  // default to outstanding
        unit_price: Number(item.price) || 0,
        amount: Number(item.amount) || 0,
      };
    });
    setItems(initializedItems);
    setLoading(false);
  }, [initialPO, navigate]);

  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    const qty = Math.max(0, parseFloat(value) || 0);
    newItems[index] = { ...newItems[index], received_quantity: qty };
    setItems(newItems);
  };

  const getItemSummary = (item) => {
    const total = item.already_received + Number(item.received_quantity || 0);
    const extraQty = Math.max(0, Number(item.received_quantity || 0) - item.outstanding_quantity);
    const isOver = Number(item.received_quantity || 0) > item.outstanding_quantity;
    const isExact = total === item.ordered_quantity;
    const isPartial = total < item.ordered_quantity;
    return { total, extraQty, isOver, isExact, isPartial };
  };

  const calculateTotals = () => {
    let totalOrderedQty = 0, totalReceivedQty = 0, totalExtraQty = 0, totalReceivedAmt = 0;
    items.forEach(item => {
      const recv = Number(item.received_quantity) || 0;
      const extra = Math.max(0, recv - item.outstanding_quantity);
      totalOrderedQty += item.ordered_quantity;
      totalReceivedQty += item.already_received + recv;
      totalExtraQty += extra;
      totalReceivedAmt += recv * (item.unit_price || 0);
    });
    return { totalOrderedQty, totalReceivedQty, totalExtraQty, totalReceivedAmt };
  };

  const { totalOrderedQty, totalReceivedQty, totalExtraQty, totalReceivedAmt } = calculateTotals();
  const hasOverReceipt = items.some(item => Number(item.received_quantity || 0) > item.outstanding_quantity);

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      let isPartialEntry = false;
      const itemsPayload = items.map(item => {
        const recv = Number(item.received_quantity) || 0;
        const totalAfter = item.already_received + recv;
        if (totalAfter < item.ordered_quantity) isPartialEntry = true;
        const extraQty = Math.max(0, recv - item.outstanding_quantity);
        const itemTotal = recv * (item.unit_price || 0);
        return {
          id: item.id,
          productId: item.product_id,
          orderedQuantity: item.ordered_quantity,
          receivedQuantity: recv,
          extraQuantity: extraQty,
          unitPrice: item.unit_price,
          totalPrice: itemTotal,
          differenceQuantity: item.outstanding_quantity - recv,
        };
      });

      const payload = {
        poId: po.id,
        remarks,
        totalReceivedAmount: totalReceivedAmt,
        status: isPartialEntry ? 'PARTIAL' : 'FULLY_RECEIVED',
        items: itemsPayload,
      };

      const response = await api.post('/gate-entry/verify', payload);
      if (response.data) {
        toast.success('✅ Gate Verification complete! Stock updated.');
        navigate('/gate-entry');
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Error verifying gate entry';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const thStyle = { padding: '10px 12px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', background: '#f7fafc', borderBottom: '1px solid #e2e8f0' };
  const tdStyle = { padding: '12px', fontSize: '13px', color: '#4a5568', borderBottom: '1px solid #edf2f7' };

  if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>Gate Verification</h2>
          <p style={{ margin: '4px 0 0', color: '#a0aec0', fontSize: '13px' }}>PO: {po.po_number} | Vendor: {po.vendor_name}</p>
        </div>
        <button onClick={() => navigate('/gate-entry')}
          style={{ padding: '10px 20px', background: '#fff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          ← Back
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>

        {/* PO Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '16px', background: '#f7fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          {[
            { label: 'PO Number', value: po.po_number, color: '#2b6cb0' },
            { label: 'Vendor', value: po.vendor_name },
            { label: 'Order Value', value: `₹ ${Number(po.total_amount).toFixed(2)}` },
            { label: 'PO Date', value: new Date(po.po_date).toLocaleDateString('en-GB') },
          ].map((f, i) => (
            <div key={i}>
              <span style={{ color: '#a0aec0', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{f.label}</span>
              <div style={{ fontWeight: 600, color: f.color || '#2d3748', fontSize: '15px' }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Over-receipt info banner */}
        {hasOverReceipt && (
          <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📦</span>
            <span style={{ color: '#92400e', fontWeight: '600', fontSize: '13px' }}>
              Over-receipt detected on one or more items. Extra quantities will be tracked separately.
            </span>
          </div>
        )}

        {/* Items Table */}
        <h3 style={{ fontSize: '15px', color: '#2d3748', borderBottom: '1px solid #edf2f7', paddingBottom: '10px', marginBottom: '14px' }}>Verify Items</h3>
        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Ordered</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Past Recv.</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Outstanding</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Now Receiving</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Extra Qty</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const { extraQty, isOver, isExact, isPartial } = getItemSummary(item);
                const rowBg = isOver ? '#fffff0' : isExact ? '#f0fff4' : isPartial ? '#fff' : '#fff';
                return (
                  <tr key={index} style={{ background: rowBg }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                      <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '2px' }}>Rate: ₹{item.unit_price} / {item.unit}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>{item.ordered_quantity}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#718096' }}>{item.already_received}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#2b6cb0', fontWeight: '600' }}>{item.outstanding_quantity}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.received_quantity}
                        onChange={e => handleQuantityChange(index, e.target.value)}
                        style={{
                          width: '90px', padding: '6px 8px', borderRadius: '4px', textAlign: 'right',
                          border: isOver ? '2px solid #d69e2e' : '1px solid #cbd5e0',
                          fontWeight: 'bold', color: '#2b6cb0', outline: 'none'
                        }}
                      />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {extraQty > 0
                        ? <span style={{ fontWeight: '700', color: '#d69e2e', background: '#fffff0', border: '1px solid #f6e05e', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>+{extraQty.toFixed(0)}</span>
                        : <span style={{ color: '#a0aec0' }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {isOver && <span style={{ color: '#d69e2e', fontSize: '11px', fontWeight: 'bold' }}>OVER ⚠️</span>}
                      {!isOver && isPartial && <span style={{ color: '#d69e2e', fontSize: '11px', fontWeight: 'bold' }}>PARTIAL</span>}
                      {!isOver && isExact && <span style={{ color: '#38a169', fontSize: '11px', fontWeight: 'bold' }}>EXACT ✓</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals + Remarks */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>Remarks (Optional)</label>
            <textarea
              value={remarks} onChange={e => setRemarks(e.target.value)}
              placeholder="Enter any notes from the gate..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', minHeight: '60px', fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ minWidth: '240px', background: '#f7fafc', padding: '16px', borderRadius: '8px', border: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Total Ordered Qty', value: totalOrderedQty.toFixed(0), color: '#2d3748' },
              { label: 'Total Received Qty', value: totalReceivedQty.toFixed(0), color: '#38a169' },
              { label: 'Extra Qty (Over)', value: `+${totalExtraQty.toFixed(0)}`, color: totalExtraQty > 0 ? '#d69e2e' : '#a0aec0' },
              { label: 'Received Amount', value: `₹ ${totalReceivedAmt.toFixed(2)}`, color: '#2b6cb0' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#718096' }}>{row.label}:</span>
                <span style={{ fontWeight: '700', color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={handleVerify}
            disabled={submitting}
            style={{
              padding: '12px 28px',
              background: submitting ? '#a0aec0' : '#48bb78',
              color: '#fff', border: 'none', borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: '700', fontSize: '15px'
            }}>
            {submitting ? 'Processing...' : 'Confirm Receipt & Complete Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GateVerification;
