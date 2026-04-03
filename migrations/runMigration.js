const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const query = fs.readFileSync(
  path.join(__dirname, '..', 'migrations', 'schema.sql'),
  'utf8'
);

const client = new Client({
  connectionString: 'postgresql://postgres:Abhi_1234@localhost:5432/MyDB'
});

async function runSchema() {
  try {
    await client.connect();
    console.log('Connected to Database');
    await client.query(query);
    console.log('Schema executed successfully. Tables created.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
}

runSchema();
