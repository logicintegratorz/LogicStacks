const db = require('../config/db');

class VendorModel {
  static async getAll() {
    const query = `
      SELECT id, name, email, phone, address, gst_number, status, created_at
      FROM vendors
      WHERE status = 'active'
      ORDER BY name ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }
}

module.exports = VendorModel;
