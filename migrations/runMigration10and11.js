// Run migration 010 and 011 using the hardcoded connection (matching existing pattern)
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Abhi_1234@localhost:5432/MyDB'
  });

  try {
    await client.connect();
    console.log('✅ Connected to Database');

    const files = [
      '010_gate_entry_stock_link.sql',
      '011_product_vendor_mapping.sql'
    ];

    for (const file of files) {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await client.query(sql);
      console.log(`✅ ${file} executed successfully`);
    }

  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
}

runMigrations();
