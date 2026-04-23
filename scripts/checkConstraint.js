require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../config/db');

async function check() {
  try {
    // Check the actual constraint definition in the live DB
    const r1 = await db.query(
      "SELECT pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conname = 'users_role_check'"
    );
    console.log('Constraint definition:', r1.rows.length ? r1.rows[0].def : 'NOT FOUND');

    // Also show current users table structure
    const r2 = await db.query(
      "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
    );
    console.log('\nUsers table columns:');
    r2.rows.forEach(r => console.log(' -', r.column_name, '|', r.data_type, '| default:', r.column_default));

    // Show existing users (without password)
    const r3 = await db.query('SELECT id, name, email, role, created_at FROM users');
    console.log('\nExisting users:', r3.rows.length ? r3.rows : 'none');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await db.end();
  }
}

check();
