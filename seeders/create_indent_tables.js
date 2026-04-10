const db = require('../config/db');

async function createTables() {
  try {
    console.log('Creating Indents and Indent Items tables...');
    
    // Create indents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS indents (
        id SERIAL PRIMARY KEY,
        indent_date DATE NOT NULL,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('indents table created.');

    // Create indent_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS indent_items (
        id SERIAL PRIMARY KEY,
        indent_id INTEGER REFERENCES indents(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        unit VARCHAR(50),
        quantity NUMERIC NOT NULL CHECK (quantity > 0)
      );
    `);
    console.log('indent_items table created.');

    console.log('All required tables for Indent module have been created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    process.exit();
  }
}

createTables();
