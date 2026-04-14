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
        INSERT INTO purchase_orders (po_number, intent_id, vendor_id, po_date, remarks, terms_conditions, total_amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, po_number, intent_id, vendor_id, po_date, status, approval_status, remarks, terms_conditions, total_amount, created_at
      `;
      const poRes = await client.query(insertPOQuery, [
        poNumber,
        poData.intentId || null,
        poData.vendorId,
        poData.poDate,
        poData.remarks,
        poData.termsConditions,
        poData.totalAmount
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
        po.created_at,
        v.name AS vendor_name,
        i.intend_no AS intent_no
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN intents i ON po.intent_id = i.id
      ORDER BY po.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
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
        po.created_at,
        v.name AS vendor_name,
        i.intend_no AS intent_no,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', poi.id,
            'product_id', poi.product_id,
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
}

module.exports = POModel;
