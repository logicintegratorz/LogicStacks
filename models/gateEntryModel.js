const db = require('../config/db');

class GateEntryModel {
  static async create(entryData, items) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Insert Gate Entry
      const insertEntryQuery = `
        INSERT INTO gate_entries (po_id, gatekeeper_id, received_date, total_received_amount, remarks, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const entryRes = await client.query(insertEntryQuery, [
        entryData.poId,
        entryData.gatekeeperId || null,
        entryData.receivedDate,
        entryData.totalReceivedAmount,
        entryData.remarks,
        entryData.status // FULLY_RECEIVED, PARTIAL
      ]);
      const newEntry = entryRes.rows[0];

      // 2. Insert Items and update PO Items
      const insertedItems = [];
      for (const item of items) {
        const insertItemQuery = `
          INSERT INTO gate_entry_items (gate_entry_id, product_id, ordered_quantity, received_quantity, unit_price, total_price, difference_quantity)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;
        const itemRes = await client.query(insertItemQuery, [
          newEntry.id,
          item.productId,
          item.orderedQuantity,
          item.receivedQuantity,
          item.unitPrice,
          item.totalPrice,
          item.differenceQuantity
        ]);
        insertedItems.push(itemRes.rows[0]);

        // Update purchase_order_items.received_quantity
        const updatePoItemsQuery = `
          UPDATE purchase_order_items
          SET received_quantity = received_quantity + $1
          WHERE purchase_order_id = $2 AND product_id = $3
        `;
        await client.query(updatePoItemsQuery, [item.receivedQuantity, entryData.poId, item.productId]);
      }

      // 3. Update Purchase Order Status
      // Determine if PO should be marked as "Received" (fully) or remain "Partially Received" / "Ordered"
      // If status from frontend says it's FULLY_RECEIVED, mark PO as Received.
      // If PARTIAL, mark as Partially Received.
      let poNextStatus = 'Ordered';
      if (entryData.status === 'FULLY_RECEIVED') {
        poNextStatus = 'Received';
      } else if (entryData.status === 'PARTIAL') {
        poNextStatus = 'Partially Received';
      }

      const updatePoQuery = `
        UPDATE purchase_orders
        SET status = $1
        WHERE id = $2
      `;
      await client.query(updatePoQuery, [poNextStatus, entryData.poId]);
      
      await client.query('COMMIT');
      return { ...newEntry, items: insertedItems };
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
        ge.*,
        po.po_number,
        po.po_date,
        v.name AS vendor_name,
        u.name AS gatekeeper_name
      FROM gate_entries ge
      JOIN purchase_orders po ON ge.po_id = po.id
      JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN users u ON ge.gatekeeper_id = u.id
      ORDER BY ge.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        ge.*,
        po.po_number,
        po.po_date,
        v.name AS vendor_name,
        u.name AS gatekeeper_name,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', gei.id,
            'product_id', gei.product_id,
            'product_name', p.name,
            'ordered_quantity', gei.ordered_quantity,
            'received_quantity', gei.received_quantity,
            'unit_price', gei.unit_price,
            'total_price', gei.total_price,
            'difference_quantity', gei.difference_quantity
          )
        ) FILTER (WHERE gei.id IS NOT NULL) AS items
      FROM gate_entries ge
      JOIN purchase_orders po ON ge.po_id = po.id
      JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN users u ON ge.gatekeeper_id = u.id
      LEFT JOIN gate_entry_items gei ON ge.id = gei.gate_entry_id
      LEFT JOIN products p ON gei.product_id = p.id
      WHERE ge.id = $1
      GROUP BY ge.id, po.po_number, po.po_date, v.name, u.name
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = GateEntryModel;
