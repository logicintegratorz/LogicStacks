-- Migration 012: Add extra_quantity tracking to gate_entry_items
-- and summary qty columns to gate_entries

-- 1. Add extra_quantity to gate_entry_items
ALTER TABLE gate_entry_items
  ADD COLUMN IF NOT EXISTS extra_quantity DECIMAL(10, 2) DEFAULT 0;

-- 2. Add qty summary columns to gate_entries header
ALTER TABLE gate_entries
  ADD COLUMN IF NOT EXISTS total_ordered_qty DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_received_qty DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_extra_qty DECIMAL(10, 2) DEFAULT 0;

-- 3. Drop the constraint blocking received_quantity > 0 check
--    (received_quantity >= 0 check already allows 0; over-receipt is now permitted in app logic)
--    The model-level "cannot exceed" throw is removed in gateEntryModel.js

-- 4. Update existing records: compute extra_quantity for historical data
UPDATE gate_entry_items
  SET extra_quantity = GREATEST(0, received_quantity - ordered_quantity)
  WHERE extra_quantity = 0;

-- 5. Update gate_entries totals for historical data
UPDATE gate_entries ge
  SET
    total_ordered_qty  = (SELECT COALESCE(SUM(ordered_quantity), 0)  FROM gate_entry_items WHERE gate_entry_id = ge.id),
    total_received_qty = (SELECT COALESCE(SUM(received_quantity), 0) FROM gate_entry_items WHERE gate_entry_id = ge.id),
    total_extra_qty    = (SELECT COALESCE(SUM(GREATEST(0, received_quantity - ordered_quantity)), 0) FROM gate_entry_items WHERE gate_entry_id = ge.id);
