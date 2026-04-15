const GateEntryModel = require('../models/gateEntryModel');
const db = require('../config/db'); // Needed if querying pending POs directly or we can use POModel

class GateEntryController {
  // Get POs that are approved and ready for gate entry
  static async getPendingPOs(req, res) {
    try {
      const query = `
        SELECT 
          po.id,
          po.po_number,
          po.po_date,
          po.status,
          po.total_amount,
          po.remarks,
          v.name AS vendor_name,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', poi.product_id,
              'product_id', poi.product_id,
              'product_name', p.name,
              'quantity', poi.quantity,
              'received_quantity', poi.received_quantity,
              'unit', poi.unit,
              'price', poi.price,
              'amount', poi.amount
            )
          ) FILTER (WHERE poi.id IS NOT NULL) AS items
        FROM purchase_orders po
        JOIN vendors v ON po.vendor_id = v.id
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        LEFT JOIN products p ON poi.product_id = p.id
        WHERE po.approval_status = 'Approved' 
          AND po.status IN ('Ordered', 'Partially Received')
        GROUP BY po.id, v.name
        ORDER BY po.created_at ASC
      `;
      const { rows } = await db.query(query);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching pending POs for gate entry:', error);
      res.status(500).json({ error: 'Failed to fetch pending POs' });
    }
  }

  // Create gate entry
  static async verifyAndReceive(req, res) {
    try {
      const { poId, remarks, totalReceivedAmount, items, status } = req.body;
      const gatekeeperId = req.user ? req.user.id : null; // Assuming auth middleware sets req.user

      if (!poId || !items || !items.length) {
        return res.status(400).json({ error: 'PO ID and items are required' });
      }

      const entryData = {
        poId,
        gatekeeperId,
        receivedDate: new Date().toISOString().slice(0, 10),
        totalReceivedAmount,
        remarks,
        status // 'FULLY_RECEIVED' or 'PARTIAL'
      };

      const result = await GateEntryModel.create(entryData, items);
      res.status(201).json({ message: 'Gate entry created successfully', data: result });
    } catch (error) {
      console.error('Error creating gate entry:', error);
      res.status(500).json({ error: 'Failed to create gate entry' });
    }
  }

  // Get all gate entries
  static async getAll(req, res) {
    try {
      const entries = await GateEntryModel.getAll();
      res.json(entries);
    } catch (error) {
      console.error('Error fetching gate entries:', error);
      res.status(500).json({ error: 'Failed to fetch gate entries' });
    }
  }

  // Get single gate entry
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const entry = await GateEntryModel.getById(id);
      if (!entry) {
        return res.status(404).json({ error: 'Gate entry not found' });
      }
      res.json(entry);
    } catch (error) {
      console.error('Error fetching gate entry:', error);
      res.status(500).json({ error: 'Failed to fetch gate entry' });
    }
  }
}

module.exports = GateEntryController;
