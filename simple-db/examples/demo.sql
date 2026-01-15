-- 🏥 CLINICALITE DEMO SCRIPT
-- Copy and paste these commands into the terminal (npm run dev)

-- 1. Initialize the Ward
-- We create a table with a Primary Key to ensure patient IDs are unique.
CREATE TABLE patients (id INT PRIMARY KEY, name VARCHAR, status VARCHAR);

-- 2. Admit the First Patient
-- This inserts a record into the JSON storage.
INSERT INTO patients (id, name, status) VALUES (101, 'Maxwel Geofrey', 'Admitted');

-- 3. Admit a Second Patient
INSERT INTO patients (id, name, status) VALUES (102, 'Sarah Connor', 'Critical');

-- 4. View the Ward Report
-- This parses the storage and displays data in a table.

-- 5. The "Security" Test (Duplicate ID)
-- This should FAIL because ID 101 already exists.
INSERT INTO patients (id, name, status) VALUES (101, 'Evil Clone', 'Healthy');