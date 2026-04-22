-- Migration 011: Add preferred_vendor_id to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS preferred_vendor_id INTEGER
  REFERENCES vendors(id) ON DELETE SET NULL;
