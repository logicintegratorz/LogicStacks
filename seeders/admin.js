const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        const name = 'Admin';
        const email = 'admin@example.com';
        const password = 'admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'Admin';

        // Check if admin already exists
        const checkQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(checkQuery, [email]);

        if (rows.length > 0) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const insertQuery = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        await db.query(insertQuery, [name, email, hashedPassword, role]);

        console.log('Admin user seeded successfully!');
        console.log('Email: admin@example.com');
        console.log('Password: admin@123');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
