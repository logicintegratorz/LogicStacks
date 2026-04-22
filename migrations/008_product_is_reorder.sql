-- Add is_reorder flag to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_reorder BOOLEAN DEFAULT FALSE;
