-- 1. Create Department Table
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(150) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert predefined department records
INSERT INTO departments (department_name) VALUES 
    ('Billets'),
    ('CCM'),
    ('Coiler'),
    ('Lab'),
    ('Maintenance'),
    ('Furnace'),
    ('Multi Department'),
    ('Pipe Plant'),
    ('Rolling Mill')
ON CONFLICT (department_name) DO NOTHING;

-- 3. Create Issue Master Table
CREATE TABLE IF NOT EXISTS issue_master (
    issue_id SERIAL PRIMARY KEY,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) -- Optional relationship to users
);

-- 4. Create Issue Details Table
CREATE TABLE IF NOT EXISTS issue_details (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issue_master(issue_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    department_id INTEGER REFERENCES departments(department_id) ON DELETE RESTRICT,
    issued_qty INTEGER NOT NULL CHECK (issued_qty > 0),
    remarks VARCHAR(255)
);

-- Query to fetch departments for dropdown (Requirement 4)
-- SELECT department_id as value, department_name as label FROM departments WHERE status = 'active' ORDER BY department_name ASC;
