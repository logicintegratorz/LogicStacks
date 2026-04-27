const db = require('../config/db');

class ProductModel {
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT p.*, c.name AS category_name, v.name AS preferred_vendor_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.preferred_vendor_id = v.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await db.query(query, [limit, offset]);

    const countQuery = 'SELECT COUNT(*) FROM products';
    const { rows: countRows } = await db.query(countQuery);
    const total = parseInt(countRows[0].count);

    return {
      products: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getReorderProducts() {
    const query = `
      SELECT p.*, c.name AS category_name, v.name AS preferred_vendor_name,
        (
          SELECT gei.unit_price 
          FROM gate_entries ge
          JOIN gate_entry_items gei ON ge.id = gei.gate_entry_id
          WHERE gei.product_id = p.id
          ORDER BY ge.received_date DESC, ge.id DESC
          LIMIT 1
        ) AS last_purchase_price
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.preferred_vendor_id = v.id
      WHERE p.is_reorder = true
        AND EXISTS (SELECT 1 FROM issue_details id WHERE id.product_id = p.id)
      ORDER BY p.name ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT p.*, c.name AS category_name, v.name AS preferred_vendor_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.preferred_vendor_id = v.id
      WHERE p.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async create(productData) {
    const {
      name, category_id, sku, supplier, party_price, is_consumable,
      description, base_unit, opening_quantity, opening_stock_price,
      average_consumption, min_days_required, average_delivery_days,
      location, is_reorder, preferred_vendor_id
    } = productData;

    const query = `
      INSERT INTO products (
        name, category_id, sku, supplier, party_price, is_consumable,
        description, base_unit, opening_quantity, opening_stock_price,
        average_consumption, min_days_required, average_delivery_days,
        location, is_reorder, preferred_vendor_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      name, category_id, sku, supplier, party_price, is_consumable,
      description, base_unit, opening_quantity, opening_stock_price,
      average_consumption, min_days_required, average_delivery_days,
      location, is_reorder || false, preferred_vendor_id || null
    ]);
    return rows[0];
  }

  static async update(id, productData) {
    const {
      name, category_id, sku, supplier, party_price, is_consumable,
      description, base_unit, opening_quantity, opening_stock_price,
      average_consumption, min_days_required, average_delivery_days,
      location, is_reorder, preferred_vendor_id
    } = productData;

    const query = `
      UPDATE products
      SET name=$2, category_id=$3, sku=$4, supplier=$5, party_price=$6, is_consumable=$7,
          description=$8, base_unit=$9, opening_quantity=$10, opening_stock_price=$11,
          average_consumption=$12, min_days_required=$13, average_delivery_days=$14,
          location=$15, is_reorder=$16, preferred_vendor_id=$17
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      id, name, category_id, sku, supplier, party_price, is_consumable,
      description, base_unit, opening_quantity, opening_stock_price,
      average_consumption, min_days_required, average_delivery_days,
      location, is_reorder !== undefined ? is_reorder : false,
      preferred_vendor_id || null
    ]);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async getStats() {
    const productCountQuery = 'SELECT COUNT(*) FROM products';
    const categoryCountQuery = 'SELECT COUNT(*) FROM categories';
    const lowStockQuery = 'SELECT * FROM products WHERE opening_quantity < 5';
    const valueQuery = 'SELECT SUM(opening_quantity) as total_items, SUM(opening_quantity * opening_stock_price) as total_value FROM products';

    const [pRes, cRes, lsRes, valRes] = await Promise.all([
      db.query(productCountQuery),
      db.query(categoryCountQuery),
      db.query(lowStockQuery),
      db.query(valueQuery)
    ]);

    return {
      totalProducts: parseInt(pRes.rows[0].count),
      totalCategories: parseInt(cRes.rows[0].count),
      lowStockItems: lsRes.rows,
      totalInventoryItems: parseInt(valRes.rows[0].total_items) || 0,
      totalInventoryValue: parseFloat(valRes.rows[0].total_value) || 0
    };
  }
}

module.exports = ProductModel;
