require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DB_URL || 'postgresql://postgres:Abhi_1234@localhost:5432/MyDB'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Database');
    // Set 3 random products to is_reorder = true
    const res = await client.query(`
      UPDATE products 
      SET is_reorder = true 
      WHERE id IN (
        SELECT id FROM products LIMIT 3
      )
      RETURNING id, name
    `);
    console.log('Products marked for reorder:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
}

run();
