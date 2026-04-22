const db = require('../config/db');

class IntentModel {
  static async create(intentData, items) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const intendNo = `INT-${dateStr}-${randomSuffix}`;
      
      // Insert Intent
      const insertIntentQuery = `
        INSERT INTO intents (intend_no, intend_date, remarks)
        VALUES ($1, $2, $3)
        RETURNING id, intend_no, intend_date, status, approval_status, remarks, created_at
      `;
      const intentRes = await client.query(insertIntentQuery, [intendNo, intentData.indentDate, intentData.remarks]);
      const newIntent = intentRes.rows[0];
      
      // Insert Items
      const insertedItems = [];
      for (const item of items) {
        const insertItemQuery = `
          INSERT INTO intent_items (intent_id, product_id, unit, quantity)
          VALUES ($1, $2, $3, $4)
          RETURNING id, intent_id, product_id, unit, quantity
        `;
        const itemRes = await client.query(insertItemQuery, [newIntent.id, item.productId, item.unit, item.quantity]);
        insertedItems.push(itemRes.rows[0]);
      }
      
      await client.query('COMMIT');
      
      return { ...newIntent, items: insertedItems };
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
        i.id,
        i.intend_no,
        i.intend_date AS indent_date,
        i.status,
        i.approval_status,
        i.remarks,
        i.created_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ii.id,
            'product_id', ii.product_id,
            'product_name', p.name,
            'unit', ii.unit,
            'quantity', ii.quantity
          )
        ) FILTER (WHERE ii.id IS NOT NULL) AS items
      FROM intents i
      LEFT JOIN intent_items ii ON i.id = ii.intent_id
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE i.is_deleted = FALSE
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        i.id,
        i.intend_no,
        i.intend_date AS indent_date,
        i.status,
        i.approval_status,
        i.remarks,
        i.created_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ii.id,
            'product_id', ii.product_id,
            'product_name', p.name,
            'unit', ii.unit,
            'quantity', ii.quantity
          )
        ) FILTER (WHERE ii.id IS NOT NULL) AS items
      FROM intents i
      LEFT JOIN intent_items ii ON i.id = ii.intent_id
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE i.id = $1
      GROUP BY i.id
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async updateApprovalStatus(id, approvalStatus) {
    const query = `
      UPDATE intents
      SET approval_status = $1
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [approvalStatus, id]);
    return rows[0];
  }

  static async updateCompleteStatus(id, status) {
    const query = `
      UPDATE intents
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [status, id]);
    return rows[0];
  }

  static async updateIntent(id, intentData, items) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      const updateIntentQuery = `
        UPDATE intents 
        SET intend_date = $1, remarks = $2
        WHERE id = $3
        RETURNING id, intend_no, intend_date, status, approval_status, remarks, created_at
      `;
      const intentRes = await client.query(updateIntentQuery, [intentData.indentDate, intentData.remarks, id]);
      const updatedIntent = intentRes.rows[0];
      
      if (!updatedIntent) {
        throw new Error('Intent not found');
      }

      await client.query('DELETE FROM intent_items WHERE intent_id = $1', [id]);
      
      const insertedItems = [];
      for (const item of items) {
        const insertItemQuery = `
          INSERT INTO intent_items (intent_id, product_id, unit, quantity)
          VALUES ($1, $2, $3, $4)
          RETURNING id, intent_id, product_id, unit, quantity
        `;
        const itemRes = await client.query(insertItemQuery, [id, item.productId, item.unit, item.quantity]);
        insertedItems.push(itemRes.rows[0]);
      }
      
      await client.query('COMMIT');
      return { ...updatedIntent, items: insertedItems };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async softDeleteIntent(id, deletedBy) {
    const query = `
      UPDATE intents
      SET is_deleted = TRUE, deleted_by = $1, deleted_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [deletedBy, id]);
    return rows[0];
  }
}

module.exports = IntentModel;
