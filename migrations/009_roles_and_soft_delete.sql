-- Migration: Add roles to users table and soft delete fields to purchase_orders and intents

-- Alter users table to add role check constraint
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'user'));

-- Add soft delete fields to purchase_orders
ALTER TABLE purchase_orders ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE purchase_orders ADD COLUMN deleted_by INTEGER REFERENCES users(id);
ALTER TABLE purchase_orders ADD COLUMN deleted_at TIMESTAMP;

-- Add soft delete fields to intents
ALTER TABLE intents ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE intents ADD COLUMN deleted_by INTEGER REFERENCES users(id);
ALTER TABLE intents ADD COLUMN deleted_at TIMESTAMP;
