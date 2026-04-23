/**
 * Migration: Normalize all role values to lowercase ('Admin' → 'admin', etc.)
 * and update the DB check constraint to match.
 * Run: node scripts/fixRoles.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../config/db');

async function fixRoles() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Drop the old capitalized constraint
    await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    console.log('✅ Dropped old role check constraint');

    // 2. Normalize all existing role values to lowercase
    const updated = await client.query(`
      UPDATE users 
      SET role = LOWER(role) 
      WHERE role != LOWER(role)
      RETURNING id, email, role
    `);
    console.log(`✅ Normalized ${updated.rowCount} user(s) to lowercase roles:`);
    updated.rows.forEach(r => console.log(`   - [${r.id}] ${r.email} → role: ${r.role}`));

    // 3. Add the new lowercase constraint
    await client.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('admin', 'manager', 'user'))
    `);
    console.log("✅ Added new constraint: role IN ('admin', 'manager', 'user')");

    await client.query('COMMIT');

    // 4. Verify
    const users = await db.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('\n📋 Current users after fix:');
    users.rows.forEach(u => console.log(`   [${u.id}] ${u.name} | ${u.email} | role: ${u.role}`));

    console.log('\n🎉 Role normalization complete! All roles are now lowercase.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await db.end();
  }
}

fixRoles();
