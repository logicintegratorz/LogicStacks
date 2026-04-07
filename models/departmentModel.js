const db = require('../config/db');

class DepartmentModel {
  static async getAllActive() {
    const query = 'SELECT department_id, department_name FROM departments WHERE status = $1 ORDER BY department_name ASC';
    const { rows } = await db.query(query, ['active']);
    return rows;
  }
}

module.exports = DepartmentModel;
