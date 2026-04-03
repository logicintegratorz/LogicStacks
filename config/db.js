const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Abhi_1234@localhost:5432/MyDB'
});

module.exports = pool;