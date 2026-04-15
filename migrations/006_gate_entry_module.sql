-- Alter purchase_orders status constraint to include Partially Received
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_status_check CHECK (status IN ('Draft', 'Ordered', 'Partially Received', 'Received', 'Cancelled'));

-- Create Gate Entries Table
CREATE TABLE IF NOT EXISTS gate_entries (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    gatekeeper_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'FULLY_RECEIVED' CHECK (status IN ('FULLY_RECEIVED', 'PARTIAL', 'REJECTED')),
    total_received_amount DECIMAL(12, 2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for Gate Entries updated_at
DROP TRIGGER IF EXISTS gate_entries_updated_at ON gate_entries;
CREATE TRIGGER gate_entries_updated_at
BEFORE UPDATE ON gate_entries
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create Gate Entry Items Table
CREATE TABLE IF NOT EXISTS gate_entry_items (
    id SERIAL PRIMARY KEY,
    gate_entry_id INTEGER REFERENCES gate_entries(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    ordered_quantity DECIMAL(10, 2) NOT NULL CHECK (ordered_quantity > 0),
    received_quantity DECIMAL(10, 2) NOT NULL CHECK (received_quantity >= 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12, 2) NOT NULL,
    difference_quantity DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
