const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Abhi_1234@localhost:5432/MyDB'
  });

  try {
    await client.connect();
    console.log('Connected to Database');
    
    // Drop existing constraint if exists
    await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
    console.log('Dropped existing role check if any.');
    
    // Add role check
    await client.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'user'))`);
    console.log('Role check added.');
    
    // Add soft delete to purchase_orders
    await client.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id)`);
    await client.query(`ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`);
    console.log('Soft delete added to purchase_orders.');
    
    // Add soft delete to intents
    await client.query(`ALTER TABLE intents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE intents ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id)`);
    await client.query(`ALTER TABLE intents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`);
    console.log('Soft delete added to intents.');
    
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

runMigration();
