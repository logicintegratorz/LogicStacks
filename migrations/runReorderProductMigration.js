require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const query = fs.readFileSync(
  path.join(__dirname, '008_product_is_reorder.sql'),
  'utf8'
);

const client = new Client({
  connectionString: process.env.DB_URL || 'postgresql://postgres:Abhi_1234@localhost:5432/MyDB'
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to Database');
    await client.query(query);
    console.log('Migration 008 executed successfully. is_reorder added to products.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
}

runMigration();
