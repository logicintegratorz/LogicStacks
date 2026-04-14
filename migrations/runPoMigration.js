const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Abhi_1234@localhost:5432/MyDB'
  });

  try {
    await client.connect();
    console.log('Connected to Database');
    
    // First, let's run 003_intents.sql just in case it wasn't run
    const query3 = fs.readFileSync(
      path.join(__dirname, '003_intents.sql'),
      'utf8'
    );
    await client.query(query3);
    console.log('003_intents.sql executed successfully.');

    // Now run 004_po_module.sql
    const query4 = fs.readFileSync(
      path.join(__dirname, '004_po_module.sql'),
      'utf8'
    );
    await client.query(query4);
    console.log('004_po_module.sql executed successfully.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
}

runSchema();
