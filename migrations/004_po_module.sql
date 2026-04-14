-- 1. Create Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    address TEXT,
    gst_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Dummy Vendors
INSERT INTO vendors (name, email, phone, address, gst_number) VALUES
('ABC Traders', 'contact@abctraders.com', '1234567890', '123 Market St, City', 'GSTIN1234ABC'),
('Shree Ganesh Suppliers', 'info@shreeganesh.com', '0987654321', '45 Ganesh Marg, Town', 'GSTIN9876SGS'),
('Maa Kali Enterprises', 'sales@maakali.com', '1122334455', '78 Kali Ave, Village', 'GSTIN5544MKE')
ON CONFLICT DO NOTHING;

-- 2. Create Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    intent_id INTEGER REFERENCES intents(id) ON DELETE SET NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE RESTRICT,
    po_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Ordered', 'Received', 'Cancelled')),
    approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    remarks TEXT,
    terms_conditions TEXT,
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for PO updated_at
DROP TRIGGER IF EXISTS purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER purchase_orders_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 3. Create Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    intent_item_id INTEGER REFERENCES intent_items(id) ON DELETE SET NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    amount DECIMAL(12, 2) NOT NULL,
    received_quantity DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
