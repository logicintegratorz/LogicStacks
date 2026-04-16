const db = require('./config/db');

async function fixIntentIds() {
  try {
    const q = `
      UPDATE purchase_orders po
      SET intent_id = (
        SELECT ii.intent_id 
        FROM purchase_order_items poi 
        JOIN intent_items ii ON poi.intent_item_id = ii.id
        WHERE poi.purchase_order_id = po.id AND poi.intent_item_id IS NOT NULL
        LIMIT 1
      )
      WHERE po.intent_id IS NULL 
        AND EXISTS (
          SELECT 1 FROM purchase_order_items poi 
          WHERE poi.purchase_order_id = po.id AND poi.intent_item_id IS NOT NULL
        );
    `;
    const res = await db.query(q);
    console.log(`Fixed ${res.rowCount} rows`);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
fixIntentIds();
