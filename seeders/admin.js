const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        const username = 'admin';
        const password = 'admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'admin';

        // Check if admin already exists
        const checkQuery = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(checkQuery, [username]);

        if (rows.length > 0) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const insertQuery = `
            INSERT INTO users (username, password, role)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        await db.query(insertQuery, [username, hashedPassword, role]);

        console.log('Admin user seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
