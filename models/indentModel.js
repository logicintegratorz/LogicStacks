const db = require('../config/db');

class IndentModel {
  static async create(indentData, items) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Auto-generate intend_no
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const intendNo = `INT-${dateStr}-${randomSuffix}`;

      // Insert Indent
      const insertIndentQuery = `
        INSERT INTO indents (intend_no, intend_date, remarks)
        VALUES ($1, $2, $3)
        RETURNING id, intend_no, intend_date, remarks, created_at
      `;
      const indentRes = await client.query(insertIndentQuery, [intendNo, indentData.indentDate, indentData.remarks]);
      const newIndent = indentRes.rows[0];
      
      // Insert Items
      const insertedItems = [];
      for (const item of items) {
        const insertItemQuery = `
          INSERT INTO indent_items (indent_id, product_id, unit, quantity)
          VALUES ($1, $2, $3, $4)
          RETURNING id, indent_id, product_id, unit, quantity
        `;
        const itemRes = await client.query(insertItemQuery, [newIndent.id, item.productId, item.unit, item.quantity]);
        insertedItems.push(itemRes.rows[0]);
      }
      
      await client.query('COMMIT');
      
      return { ...newIndent, items: insertedItems };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAll() {
    // Fetch all indents ordered by date descending
    const query = `
      SELECT 
        i.id,
        i.intend_no,
        i.intend_date AS indent_date,
        i.status,
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
        ) AS items
      FROM indents i
      LEFT JOIN indent_items ii ON i.id = ii.indent_id
      LEFT JOIN products p ON ii.product_id = p.id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }
}

module.exports = IndentModel;
