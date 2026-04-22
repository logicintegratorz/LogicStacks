const db = require('../config/db');

class GateEntryModel {
  static async create(entryData, items) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Compute per-item extra_qty and totals
      let totalOrderedQty = 0;
      let totalReceivedQty = 0;
      let totalExtraQty = 0;

      // 1. Insert Gate Entry header (totals filled after item loop)
      const insertEntryQuery = `
        INSERT INTO gate_entries (po_id, gatekeeper_id, received_date, total_received_amount, remarks, status,
          total_ordered_qty, total_received_qty, total_extra_qty)
        VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0)
        RETURNING *
      `;
      const entryRes = await client.query(insertEntryQuery, [
        entryData.poId,
        entryData.gatekeeperId || null,
        entryData.receivedDate,
        entryData.totalReceivedAmount,
        entryData.remarks,
        entryData.status // 'FULLY_RECEIVED' | 'PARTIAL' | 'REJECTED'
      ]);
      const newEntry = entryRes.rows[0];

      // 2. Process each item — OVER-RECEIPT IS ALLOWED
      const insertedItems = [];
      for (const item of items) {
        const orderedQty = Number(item.orderedQuantity) || 0;
        const receivedQty = Number(item.receivedQuantity) || 0;

        // Negative values not allowed
        if (receivedQty < 0) {
          throw new Error(`Product ID ${item.productId}: received quantity cannot be negative`);
        }

        // Extra quantity = how much was received over the ordered amount (0 if under)
        const extraQty = Math.max(0, receivedQty - orderedQty);

        totalOrderedQty += orderedQty;
        totalReceivedQty += receivedQty;
        totalExtraQty += extraQty;

        // Insert gate_entry_items row
        const insertItemQuery = `
          INSERT INTO gate_entry_items
            (gate_entry_id, product_id, ordered_quantity, received_quantity, extra_quantity,
             unit_price, total_price, difference_quantity)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        const itemRes = await client.query(insertItemQuery, [
          newEntry.id,
          item.productId,
          orderedQty,
          receivedQty,
          extraQty,
          item.unitPrice,
          item.totalPrice,
          orderedQty - receivedQty  // positive = short, negative = over
        ]);
        insertedItems.push(itemRes.rows[0]);

        // Update purchase_order_items.received_quantity cumulatively
        await client.query(
          `UPDATE purchase_order_items
           SET received_quantity = received_quantity + $1
           WHERE purchase_order_id = $2 AND product_id = $3`,
          [receivedQty, entryData.poId, item.productId]
        );

        // AUTO-UPDATE STOCK: increment product opening_quantity
        if (receivedQty > 0) {
          await client.query(
            `UPDATE products
             SET opening_quantity = opening_quantity + $1
             WHERE id = $2`,
            [receivedQty, item.productId]
          );
        }
      }

      // 3. Update gate entry header with computed totals
      await client.query(
        `UPDATE gate_entries SET total_ordered_qty=$1, total_received_qty=$2, total_extra_qty=$3 WHERE id=$4`,
        [totalOrderedQty, totalReceivedQty, totalExtraQty, newEntry.id]
      );

      // 4. Auto-determine PO status from cumulative received quantities
      const { rows: poItems } = await client.query(
        `SELECT quantity, received_quantity FROM purchase_order_items WHERE purchase_order_id = $1`,
        [entryData.poId]
      );

      const allReceived = poItems.length > 0 && poItems.every(
        r => Number(r.received_quantity) >= Number(r.quantity)
      );
      const anyReceived = poItems.some(r => Number(r.received_quantity) > 0);

      const newPOStatus = allReceived ? 'Received' : anyReceived ? 'Partially Received' : 'Ordered';

      await client.query(
        'UPDATE purchase_orders SET status = $1 WHERE id = $2',
        [newPOStatus, entryData.poId]
      );

      await client.query('COMMIT');
      return {
        ...newEntry,
        total_ordered_qty: totalOrderedQty,
        total_received_qty: totalReceivedQty,
        total_extra_qty: totalExtraQty,
        items: insertedItems,
        poStatus: newPOStatus
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAll(filters = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`ge.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.poId) {
      conditions.push(`ge.po_id = $${idx++}`);
      values.push(filters.poId);
    }
    if (filters.vendorId) {
      conditions.push(`po.vendor_id = $${idx++}`);
      values.push(filters.vendorId);
    }
    if (filters.dateFrom) {
      conditions.push(`ge.received_date >= $${idx++}`);
      values.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push(`ge.received_date <= $${idx++}`);
      values.push(filters.dateTo);
    }
    if (filters.search) {
      conditions.push(`(po.po_number ILIKE $${idx} OR v.name ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        ge.id,
        ge.po_id,
        ge.status,
        ge.received_date,
        ge.total_received_amount,
        ge.total_ordered_qty,
        ge.total_received_qty,
        ge.total_extra_qty,
        ge.remarks,
        ge.created_at,
        po.po_number,
        po.po_date,
        v.id AS vendor_id,
        v.name AS vendor_name,
        u.name AS gatekeeper_name
      FROM gate_entries ge
      JOIN purchase_orders po ON ge.po_id = po.id
      JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN users u ON ge.gatekeeper_id = u.id
      ${whereClause}
      ORDER BY ge.created_at DESC
    `;
    const { rows } = await db.query(query, values);
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
            'extra_quantity', gei.extra_quantity,
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

  static async getVendors() {
    const { rows } = await db.query('SELECT id, name FROM vendors ORDER BY name ASC');
    return rows;
  }

  static async update(id, updateData) {
    const { status, remarks } = updateData;
    const query = `
      UPDATE gate_entries SET status = $1, remarks = $2, updated_at = NOW()
      WHERE id = $3 RETURNING *
    `;
    const { rows } = await db.query(query, [status, remarks, id]);
    return rows[0];
  }
}

module.exports = GateEntryModel;
