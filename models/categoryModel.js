const db = require('../config/db');

class CategoryModel {
  static async getAll() {
    const query = `
      SELECT c.*, COUNT(p.id) AS product_count 
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async create({ name, description }) {
    const query = 'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *';
    const { rows } = await db.query(query, [name, description]);
    return rows[0];
  }

  static async update(id, { name, description }) {
    const query = 'UPDATE categories SET name = $2, description = $3 WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id, name, description]);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = CategoryModel;
