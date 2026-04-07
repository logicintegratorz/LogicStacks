const pool = require('../config/db');

class IssueModel {
  static async createIssue(items, userId) {
    // Obtain a client for atomic transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Create master issue record
      const masterQuery = `
        INSERT INTO issue_master (created_by) 
        VALUES ($1) 
        RETURNING issue_id
      `;
      const masterRes = await client.query(masterQuery, [userId || null]);
      const issueId = masterRes.rows[0].issue_id;

      // 2. Iterate through items
      for (const item of items) {
        const { product_id, department_id, issued_qty, remarks } = item;
        
        // Block issuing quantity less than or equal to zero
        if (issued_qty <= 0) {
           throw new Error('Issue quantity must be greater than 0.');
        }

        // a) Validate product stock exists and is sufficient
        const productCheck = await client.query('SELECT opening_quantity FROM products WHERE id = $1 FOR UPDATE', [product_id]);
        if (productCheck.rows.length === 0) throw new Error(`Product ID ${product_id} not found.`);
        
        const availableStock = productCheck.rows[0].opening_quantity;
        if (availableStock < issued_qty) {
          throw new Error(`Insufficient stock for Product ID ${product_id}. Available: ${availableStock}, Requested: ${issued_qty}`);
        }

        // b) Insert detail record
        const detailQuery = `
          INSERT INTO issue_details (issue_id, product_id, department_id, issued_qty, remarks)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(detailQuery, [issueId, product_id, department_id, issued_qty, remarks || null]);

        // c) Deduct stock
        const updateStockQuery = `
          UPDATE products 
          SET opening_quantity = opening_quantity - $1 
          WHERE id = $2
        `;
        await client.query(updateStockQuery, [issued_qty, product_id]);
      }

      await client.query('COMMIT');
      return { success: true, issue_id: issueId };

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async getAnalytics() {
    const todayQuery = `
      SELECT 
        COALESCE(SUM(id.issued_qty), 0) AS total_qty,
        COALESCE(SUM(id.issued_qty * COALESCE(p.party_price, p.opening_stock_price, 0)), 0) AS total_amount
      FROM issue_details id
      JOIN issue_master im ON id.issue_id = im.issue_id
      JOIN products p ON id.product_id = p.id
      WHERE DATE(im.issue_date) = CURRENT_DATE
    `;

    const weekQuery = `
      SELECT 
        COALESCE(SUM(id.issued_qty), 0) AS total_qty,
        COALESCE(SUM(id.issued_qty * COALESCE(p.party_price, p.opening_stock_price, 0)), 0) AS total_amount
      FROM issue_details id
      JOIN issue_master im ON id.issue_id = im.issue_id
      JOIN products p ON id.product_id = p.id
      WHERE date_trunc('week', im.issue_date) = date_trunc('week', CURRENT_DATE)
    `;

    const monthQuery = `
      SELECT 
        COALESCE(SUM(id.issued_qty), 0) AS total_qty,
        COALESCE(SUM(id.issued_qty * COALESCE(p.party_price, p.opening_stock_price, 0)), 0) AS total_amount
      FROM issue_details id
      JOIN issue_master im ON id.issue_id = im.issue_id
      JOIN products p ON id.product_id = p.id
      WHERE im.issue_date >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const [todayRes, weekRes, monthRes] = await Promise.all([
      pool.query(todayQuery),
      pool.query(weekQuery),
      pool.query(monthQuery)
    ]);

    return {
      today: {
        qty: parseInt(todayRes.rows[0].total_qty),
        amount: parseFloat(todayRes.rows[0].total_amount)
      },
      thisWeek: {
        qty: parseInt(weekRes.rows[0].total_qty),
        amount: parseFloat(weekRes.rows[0].total_amount)
      },
      last30Days: {
        qty: parseInt(monthRes.rows[0].total_qty),
        amount: parseFloat(monthRes.rows[0].total_amount)
      }
    };
  }

  static async getAllIssues() {
    const query = `
      SELECT 
        id.id as row_id,
        p.name AS product_name,
        c.name AS category_name,
        d.department_name,
        im.issue_date,
        id.issued_qty,
        COALESCE(p.party_price, p.opening_stock_price, 0) AS avg_price,
        (id.issued_qty * COALESCE(p.party_price, p.opening_stock_price, 0)) AS total_amount
      FROM issue_details id
      JOIN issue_master im ON id.issue_id = im.issue_id
      JOIN products p ON id.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN departments d ON id.department_id = d.department_id
      ORDER BY im.issue_date DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
}

module.exports = IssueModel;
