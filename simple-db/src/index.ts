// main entry point of the application
import { Database } from "./Database";

// this is a simplle script to verify database works
// Run: npm run test

// Initialize
const db = new Database();

console.log('CLINICALLITE ENGINE START...\n');

db.execute(`
  CREATE TABLE users (
  id  INT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  age INT
  )
  `);

// create (medical records Table)
console.log("1. Creates 'patients' table...");
const res1 = db.execute("CREATE TABLE patients (id INT PRIMARY KEY, name VARCHAR, status Varchar)");
console.log("👉", res1);

// Insert (Admit)
console.log('\n2. ADMITTING PATIENT 101...');
const res2 = db.execute("INSERT INTO patients (id, name, status) VALUES (101, 'Maxwel Geofrey', 'sick')");
console.log("👉", res2);

// Duplicate check
console.log("\n3. TEST:Trying to ADMIT Patient 101 again (Evil Clone)...");
const res3 = db.execute("INSERT INTO patients (id, name, status) VALUES (101, 'Evil Clone', 'Sick')");

if (res3.success === false) {
  console.log("✅ Success! The engine blocked the duplicate.");
  console.log("👉 Error Message:", res3.message);
} else {
  console.log("❌ FAIL! The engine allowed the duplicate.");
}

// SELECT
console.log("\n4 Ward Report:");
const res4 = db.execute("SELECT * FROM patients")
console.table(res4.data);