-- 013_sku_unique.sql
-- Add unique constraint to product SKU

-- First, clear out empty SKUs to be NULL or a unique placeholder if needed,
-- but assuming normal flow, let's just add the constraint.
ALTER TABLE products ADD CONSTRAINT products_sku_unique UNIQUE (sku);
