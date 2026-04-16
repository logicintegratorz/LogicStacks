-- Add parent_po_id to track Reordered Source PO
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS parent_po_id INTEGER REFERENCES purchase_orders(id) ON DELETE SET NULL;
