-- Migration 010: Ensure received_quantity on PO items + index for fast PO status recalculation
ALTER TABLE purchase_order_items
  ADD COLUMN IF NOT EXISTS received_quantity DECIMAL(10, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_poi_po_id ON purchase_order_items(purchase_order_id);
