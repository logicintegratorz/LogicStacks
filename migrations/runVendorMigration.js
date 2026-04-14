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
    
    const query = fs.readFileSync(
      path.join(__dirname, '005_vendor_extension.sql'),
      'utf8'
    );
    await client.query(query);
    console.log('005_vendor_extension.sql executed successfully.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
}

runSchema();
