const db = require('../config/db');

class POModel {
  static async create(poData, items) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Auto-generate PO number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const poNumber = `PO-${dateStr}-${randomSuffix}`;

      // Insert Purchase Order
      const insertPOQuery = `
        INSERT INTO purchase_orders (po_number, intent_id, vendor_id, po_date, remarks, terms_conditions, total_amount, parent_po_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, po_number, intent_id, vendor_id, po_date, status, approval_status, remarks, terms_conditions, total_amount, parent_po_id, created_at
      `;
      const poRes = await client.query(insertPOQuery, [
        poNumber,
        poData.intentId || null,
        poData.vendorId,
        poData.poDate,
        poData.remarks,
        poData.termsConditions,
        poData.totalAmount,
        poData.parentPoId || null
      ]);

      const newPO = poRes.rows[0];
      
      // Insert Items
      const insertedItems = [];
      for (const item of items) {
        const insertItemQuery = `
          INSERT INTO purchase_order_items (purchase_order_id, product_id, intent_item_id, quantity, unit, price, amount)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, purchase_order_id, product_id, intent_item_id, quantity, unit, price, amount, received_quantity
        `;
        const itemRes = await client.query(insertItemQuery, [
          newPO.id,
          item.productId,
          item.intentItemId || null,
          item.quantity,
          item.unit,
          item.price,
          item.amount
        ]);
        insertedItems.push(itemRes.rows[0]);
      }
      
      await client.query('COMMIT');
      
      return { ...newPO, items: insertedItems };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAll() {
    const query = `
      SELECT 
        po.id,
        po.po_number,
        po.po_date,
        po.status,
        po.approval_status,
        po.remarks,
        po.terms_conditions,
        po.total_amount,
        po.parent_po_id,
        po.created_at,
        v.name AS vendor_name,
        i.intend_no AS intent_no
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN intents i ON po.intent_id = i.id
      WHERE po.is_deleted = FALSE ORDER BY po.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  // Returns an existing PO linked to this intent (if any) — used to prevent double-use
  static async findByIntentId(intentId) {
    const query = `
      SELECT id FROM purchase_orders
      WHERE intent_id = $1
        AND approval_status != 'Rejected'
        AND is_deleted = FALSE
      LIMIT 1
    `;
    const { rows } = await db.query(query, [intentId]);
    return rows[0] || null;
  }

  static async getById(id) {
    const query = `
      SELECT 
        po.id,
        po.po_number,
        po.po_date,
        po.status,
        po.approval_status,
        po.remarks,
        po.terms_conditions,
        po.total_amount,
        po.parent_po_id,
        po.created_at,
        po.vendor_id,
        po.intent_id,
        v.name AS vendor_name,
        i.intend_no AS intent_no,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', poi.id,
            'product_id', poi.product_id,
            'intent_item_id', poi.intent_item_id,
            'product_name', p.name,
            'quantity', poi.quantity,
            'unit', poi.unit,
            'price', poi.price,
            'amount', poi.amount,
            'received_quantity', poi.received_quantity
          )
        ) FILTER (WHERE poi.id IS NOT NULL) AS items
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN intents i ON po.intent_id = i.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
      LEFT JOIN products p ON poi.product_id = p.id
      WHERE po.id = $1
      GROUP BY po.id, v.name, i.intend_no
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async updateStatus(id, field, value) {
    // Dynamically update status or approval_status
    if (!['status', 'approval_status'].includes(field)) {
        throw new Error('Invalid update field');
    }
    const query = `
      UPDATE purchase_orders
      SET ${field} = $1
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [value, id]);
    return rows[0];
  }

  static async updatePO(id, poData, items) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update Purchase Order
      const updatePOQuery = `
        UPDATE purchase_orders
        SET vendor_id = $1, po_date = $2, remarks = $3, terms_conditions = $4, total_amount = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      const poRes = await client.query(updatePOQuery, [
        poData.vendorId, poData.poDate, poData.remarks, poData.termsConditions, poData.totalAmount, id
      ]);

      if (poRes.rows.length === 0) {
         throw new Error('Purchase Order not found');
      }
      
      // Delete existing Items
      await client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [id]);

      // Re-insert Items
      const insertedItems = [];
      for (const item of items) {
        const insertItemQuery = `
          INSERT INTO purchase_order_items (purchase_order_id, product_id, intent_item_id, quantity, unit, price, amount)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, purchase_order_id, product_id, intent_item_id, quantity, unit, price, amount, received_quantity
        `;
        const itemRes = await client.query(insertItemQuery, [
          id, item.productId, item.intentItemId || null, item.quantity, item.unit, item.price, item.amount
        ]);
        insertedItems.push(itemRes.rows[0]);
      }
      
      const updatedPO = poRes.rows[0];
      await client.query('COMMIT');
      
      return { ...updatedPO, items: insertedItems };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async softDeletePO(id, deletedBy) {
    const query = `
      UPDATE purchase_orders
      SET is_deleted = TRUE, status = 'Cancelled', deleted_by = $2, deleted_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await db.query(query, [id, deletedBy || null]);
    if (rows.length === 0) {
      throw new Error('Purchase order not found');
    }
    return rows[0];
  }
}

module.exports = POModel;
 