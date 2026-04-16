const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigration() {
    try {
        const sqlFilePath = path.join(__dirname, '007_reorder_po.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        
        await db.query(sql);
        console.log('✅ Reorder PO migration (007) applied successfully.');
    } catch (error) {
        console.error('❌ Error executing reorder po migration:', error);
    } finally {
        process.exit();
    }
}

runMigration();
