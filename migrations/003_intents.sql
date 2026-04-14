-- Drop old tables if they exist
DROP TABLE IF EXISTS indent_items CASCADE;
DROP TABLE IF EXISTS indents CASCADE;

-- Create intents table
CREATE TABLE IF NOT EXISTS intents (
    id SERIAL PRIMARY KEY,
    intend_no VARCHAR(100) UNIQUE NOT NULL,
    intend_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Incomplete' CHECK (status IN ('Incomplete', 'Complete')),
    approval_status VARCHAR(20) DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create intent_items table
CREATE TABLE IF NOT EXISTS intent_items (
    id SERIAL PRIMARY KEY,
    intent_id INTEGER REFERENCES intents(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at (optional but good practice for updated_at column)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS intents_updated_at ON intents;
CREATE TRIGGER intents_updated_at
BEFORE UPDATE ON intents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
