const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Abhi_1234@localhost:5432/MyDB'
});

async function run() {
  try {
    await client.connect();
    // Drop the old column
    await client.query('ALTER TABLE products DROP COLUMN IF EXISTS minimum_stock_quantity;');
    // Add the new location column
    await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS location VARCHAR(150);');
    console.log('Altered table successfully: Dropped minimum_stock_quantity, added location.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
