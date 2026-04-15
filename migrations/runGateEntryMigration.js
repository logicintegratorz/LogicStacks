const fs = require('fs');
const path = require('path');
const db = require('../config/db'); // Uses our singleton pool

async function runGateEntryMigration() {
  const client = await db.connect();
  try {
    const filePath = path.join(__dirname, '006_gate_entry_module.sql');
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log('Running Gate Entry Migration...');
    await client.query(sql);
    console.log('✅ Gate Entry Migration executed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  runGateEntryMigration().then(() => process.exit(0));
}

module.exports = runGateEntryMigration;
