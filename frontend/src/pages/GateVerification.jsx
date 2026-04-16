import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const GateVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Expecting PO to be passed via state from GateEntryList
  const initialPO = location.state?.po;

  const [po, setPO] = useState(initialPO || null);
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(!initialPO);
  const [submitting, setSubmitting] = useState(false);
  const [overReceiptWarning, setOverReceiptWarning] = useState(false);
  const [overrideApproved, setOverrideApproved] = useState(false);

  useEffect(() => {
    if (!initialPO) {
      toast.error('No PO selected for verification.');
      navigate('/gate-entry');
      return;
    }

    // Initialize items with received quantities set to remaining quantity by default
    const initializedItems = (initialPO.items || []).map(item => {
      const ordered = Number(item.quantity) || 0;
      const alreadyReceived = Number(item.received_quantity) || 0;
      const outstanding = Math.max(0, ordered - alreadyReceived);
      
      return {
        ...item,
        ordered_quantity: ordered,
        already_received: alreadyReceived,
        outstanding_quantity: outstanding,
        received_quantity: outstanding, // default to receiving the rest
        unit_price: Number(item.price) || 0,
        amount: Number(item.amount) || 0,
      };
    });
    setItems(initializedItems);
    setLoading(false);
  }, [initialPO, navigate]);

  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    const newReceivedQty = parseFloat(value) >= 0 ? parseFloat(value) : 0;
    newItems[index].received_quantity = newReceivedQty;
    
    // Check if any item has over receipt
    const hasOverReceipt = newItems.some(item => (item.already_received + item.received_quantity) > item.ordered_quantity);
    setOverReceiptWarning(hasOverReceipt);
    if (!hasOverReceipt) {
      setOverrideApproved(false);
    }
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    let totalReceivedAmt = 0;
    let totalOrderedAmt = 0;

    items.forEach(item => {
      const item_total = (parseFloat(item.received_quantity) || 0) * (parseFloat(item.unit_price) || 0);
      item.item_total = item_total; // Maintain value of each received item
      totalReceivedAmt += item_total;
      totalOrderedAmt += (parseFloat(item.ordered_quantity) || 0) * (parseFloat(item.unit_price) || 0);
    });

    const totalDifference = totalOrderedAmt - totalReceivedAmt;

    return { totalReceivedAmt, totalOrderedAmt, totalDifference };
  };

  const { totalReceivedAmt, totalOrderedAmt, totalDifference } = calculateTotals();

  const handleVerify = async () => {
    if (overReceiptWarning && !overrideApproved) {
      toast.error('You must approve the manual override for over-receiving items.');
      return;
    }

    setSubmitting(true);
    try {
      // Determine overall status
      let overallStatus = 'FULLY_RECEIVED';
      let isPartial = false;

      const itemsPayload = items.map(item => {
        const totalQtyNow = item.already_received + item.received_quantity;
        if (totalQtyNow < item.ordered_quantity) {
          isPartial = true;
        }
        
        return {
          id: item.id,
          productId: item.product_id,
          orderedQuantity: item.ordered_quantity,
          receivedQuantity: item.received_quantity,
          unitPrice: item.unit_price,
          totalPrice: item.item_total, // use the explicitly maintained value
          differenceQuantity: item.ordered_quantity - item.received_quantity // correctly tracking just what is missing from this transaction
        };
      });

      if (isPartial) {
        overallStatus = 'PARTIAL';
      }

      const payload = {
        poId: po.id,
        remarks,
        totalReceivedAmount: totalReceivedAmt,
        status: overallStatus,
        items: itemsPayload
      };

      const response = await api.post('/gate-entry/verify', payload);
      
      if (response.data) {
         toast.success('Gate Verification successful!');
         navigate('/gate-entry');
      }
    } catch (error) {
      toast.error('Error verifying gate entry');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getRowColor = (item) => {
    const totalQty = item.already_received + parseFloat(item.received_quantity || 0);
    if (totalQty === item.ordered_quantity) return '#f0fff4'; // Green - Match
    if (totalQty > item.ordered_quantity) return '#fff5f5'; // Red - Over
    if (totalQty > 0) return '#fffff0'; // Yellow - Partial but some received
    return 'transparent'; // No change or 0
  };

  if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)', padding: '30px', width: '100%', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
       {/* Header Section */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Gate Verification
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#a0aec0', fontSize: '13px' }}>PO: {po.po_number} | Vendor: {po.vendor_name}</p>
        </div>
        <button 
             onClick={() => navigate('/gate-entry')}
             style={{ padding: '10px 20px', background: '#fff', color: '#4a5568', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            Back to List
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', width: '100%', boxSizing: 'border-box', padding: '20px' }}>
          
         {/* PO Summary */}
         <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', background: '#f7fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <div><span style={{color: '#a0aec0', fontSize: '12px', display: 'block', textTransform: 'uppercase', fontWeight: 600}}>PO Number</span><div style={{fontWeight: 600, color: '#2b6cb0', fontSize: '15px'}}>{po.po_number}</div></div>
            <div style={{textAlign: 'right'}}><span style={{color: '#a0aec0', fontSize: '12px', display: 'block', textTransform: 'uppercase', fontWeight: 600}}>Vendor Name</span><div style={{fontWeight: 600, color: '#2d3748', fontSize: '15px'}}>{po.vendor_name}</div></div>
            <div><span style={{color: '#a0aec0', fontSize: '12px', display: 'block', textTransform: 'uppercase', fontWeight: 600}}>Order Value</span><div style={{fontWeight: 600, color: '#2d3748', fontSize: '15px'}}>₹ {Number(po.total_amount).toFixed(2)}</div></div>
            <div style={{textAlign: 'right'}}><span style={{color: '#a0aec0', fontSize: '12px', display: 'block', textTransform: 'uppercase', fontWeight: 600}}>Date</span><div style={{fontWeight: 600, color: '#2d3748', fontSize: '15px'}}>{new Date(po.po_date).toLocaleDateString('en-GB')}</div></div>
         </div>

         {/* Items Table */}
         <h3 style={{ fontSize: '16px', color: '#2d3748', borderBottom: '1px solid #edf2f7', paddingBottom: '10px', marginBottom: '15px' }}>Verify Items</h3>
         <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #edf2f7', background: '#f7fafc' }}>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase' }}>Item</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'right' }}>Ordered</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'right' }}>Past Recv.</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'right' }}>Now Receiving</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'right' }}>Amt Received</th>
                  <th style={{ padding: '12px', fontSize: '11px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                 {items.map((item, index) => {
                   const totalAfterThis = item.already_received + Number(item.received_quantity);
                   const isOver = totalAfterThis > item.ordered_quantity;
                   const isPartial = totalAfterThis < item.ordered_quantity;
                   const isMatch = totalAfterThis === item.ordered_quantity;

                   return (
                     <tr key={index} style={{ borderBottom: '1px solid #edf2f7', background: getRowColor(item) }}>
                       <td style={{ padding: '12px', fontSize: '13px', color: '#4a5568', fontWeight: 500 }}>
                          {item.product_name}
                          <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '2px' }}>Rate: ₹{item.unit_price} / {item.unit}</div>
                       </td>
                       <td style={{ padding: '12px', fontSize: '13px', color: '#4a5568', textAlign: 'right', fontWeight: '600' }}>{item.ordered_quantity}</td>
                       <td style={{ padding: '12px', fontSize: '13px', color: '#718096', textAlign: 'right' }}>{item.already_received}</td>
                       <td style={{ padding: '12px', textAlign: 'right' }}>
                         <input 
                           type="number"
                           min="0"
                           step="0.01"
                           value={item.received_quantity}
                           onChange={(e) => handleQuantityChange(index, e.target.value)}
                           style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0', textAlign: 'right', fontWeight: 'bold', color: '#2b6cb0' }}
                         />
                       </td>
                       <td style={{ padding: '12px', fontSize: '13px', color: '#38a169', textAlign: 'right', fontWeight: '600' }}>
                          ₹{item.item_total ? item.item_total.toFixed(2) : '0.00'}
                       </td>
                       <td style={{ padding: '12px', textAlign: 'center' }}>
                          {isOver && <span style={{ color: '#e53e3e', fontSize: '11px', fontWeight: 'bold' }}>OVER</span>}
                          {isPartial && <span style={{ color: '#d69e2e', fontSize: '11px', fontWeight: 'bold' }}>PARTIAL</span>}
                          {isMatch && <span style={{ color: '#38a169', fontSize: '11px', fontWeight: 'bold' }}>EXACT</span>}
                       </td>
                     </tr>
                   )
                 })}
              </tbody>
            </table>
         </div>

         {/* Warning and Override */}
         {overReceiptWarning && (
           <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '20px' }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#c53030', fontSize: '14px' }}>Over-receipt Detected</h4>
                <p style={{ margin: 0, color: '#e53e3e', fontSize: '12px' }}>You are about to receive more quantity than what was ordered. This requires a manual override.</p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#c53030', cursor: 'pointer' }}>
                 <input 
                   type="checkbox" 
                   checked={overrideApproved}
                   onChange={(e) => setOverrideApproved(e.target.checked)}
                   style={{ width: '16px', height: '16px' }}
                 />
                 Approve Override
              </label>
           </div>
         )}

         {/* Received Summary and Action */}
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
           <div style={{ flex: 1, minWidth: '300px' }}>
             <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>Remarks (Optional)</label>
             <textarea 
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any notes from the gate..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', minHeight: '60px', fontFamily: 'inherit', fontSize: '13px' }}
             />
           </div>
           
           <div style={{ minWidth: '250px', background: '#f7fafc', padding: '15px', borderRadius: '8px', border: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#718096' }}>
                 <span>Calculated Receiving Amount:</span>
                 <span style={{ fontWeight: '600', color: '#2d3748' }}>₹ {totalReceivedAmt.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#718096' }}>
                 <span>Amount Difference:</span>
                 <span style={{ fontWeight: '600', color: totalDifference < 0 ? '#e53e3e' : '#d69e2e' }}>
                    {totalDifference < 0 ? '-' : ''}₹{Math.abs(totalDifference).toFixed(2)}
                 </span>
              </div>
           </div>
         </div>

         {/* Submit Button */}
         <div style={{ marginTop: '20px', textAlign: 'right' }}>
           <button 
             onClick={handleVerify}
             disabled={submitting || (overReceiptWarning && !overrideApproved)}
             style={{ padding: '12px 24px', background: submitting || (overReceiptWarning && !overrideApproved) ? '#a0aec0' : '#48bb78', color: '#fff', border: 'none', borderRadius: '8px', cursor: submitting || (overReceiptWarning && !overrideApproved) ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '15px' }}
           >
             {submitting ? 'Processing...' : 'Confirm Receipt & Complete Entry'}
           </button>
         </div>

      </div>
    </div>
  );
};

export default GateVerification;
