const db = require('../config/db');

class VendorModel {
  static async getAll() {
    const query = `
      SELECT id, name, email, phone, address, gst_number, tax_id_type, state, country, pin_code, contact_person, status, created_at
      FROM vendors
      WHERE status = 'active'
      ORDER BY id DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async getById(id) {
    const query = `
      SELECT id, name, email, phone, address, gst_number, tax_id_type, state, country, pin_code, contact_person, status, created_at
      FROM vendors
      WHERE id = $1 AND status = 'active'
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async create(vendorData) {
    const query = `
      INSERT INTO vendors (name, email, phone, address, gst_number, tax_id_type, state, country, pin_code, contact_person)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      vendorData.name,
      vendorData.email || null,
      vendorData.phone || null,
      vendorData.address || null,
      vendorData.gst_number || null,
      vendorData.tax_id_type || 'GST',
      vendorData.state || null,
      vendorData.country || 'India',
      vendorData.pin_code || null,
      vendorData.contact_person || null
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async update(id, vendorData) {
    const query = `
      UPDATE vendors
      SET name = $1, email = $2, phone = $3, address = $4, gst_number = $5, tax_id_type = $6, state = $7, country = $8, pin_code = $9, contact_person = $10
      WHERE id = $11 AND status = 'active'
      RETURNING *
    `;
    const values = [
      vendorData.name,
      vendorData.email || null,
      vendorData.phone || null,
      vendorData.address || null,
      vendorData.gst_number || null,
      vendorData.tax_id_type || 'GST',
      vendorData.state || null,
      vendorData.country || 'India',
      vendorData.pin_code || null,
      vendorData.contact_person || null,
      id
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async softDelete(id) {
    const query = `
      UPDATE vendors
      SET status = 'inactive'
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = VendorModel;
