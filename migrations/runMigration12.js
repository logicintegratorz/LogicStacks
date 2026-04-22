const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '012_gate_entry_extra_qty.sql'),
      'utf8'
    );
    await db.query(sql);
    console.log('✅ Migration 012 (gate entry extra qty) applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration 012 failed:', error.message);
    process.exit(1);
  }
};

runMigration();
