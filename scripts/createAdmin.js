/**
 * Script to manually create an admin user in the database.
 * Usage: node scripts/createAdmin.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const db = require('../config/db');

const adminUser = {
  name: 'Super Admin',
  email: 'admin3@logicstacks.com',   // ← Change this if needed
  password: 'Admin@123',            // ← Change this before running!
  role: 'Admin',                    // Must be: 'Admin', 'Manager', or 'User'
};

async function createAdmin() {
  try {
    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [adminUser.email]);
    if (existing.rows.length > 0) {
      console.log(`⚠️  User with email "${adminUser.email}" already exists. Skipping.`);
      process.exit(0);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds);

    // Insert the admin user
    const result = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [adminUser.name, adminUser.email, hashedPassword, adminUser.role]
    );

    const user = result.rows[0];
    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log(`  ID    : ${user.id}`);
    console.log(`  Name  : ${user.name}`);
    console.log(`  Email : ${user.email}`);
    console.log(`  Role  : ${user.role}`);
    console.log(`  At    : ${user.created_at}`);
    console.log('-----------------------------------');
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
  } finally {
    await db.end();
    process.exit(0);
  }
}

createAdmin();
