import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Database } from "./Database";

// Initializing the app
const app = express();

const PORT = process.env.PORT || 10000;

// Initializing Database
const db = new Database("daat");

// --- MIDDLEWARE FIXED ---
// You must include the () to invoke the function!
app.use(cors());
app.use(bodyParser.json());

console.log("Start Clincalite backend");

// ROOT URL check
app.get("/", (req, res) => {
  res.send("✅ Clinicalite API is Running!");
});

// GET /Patients
app.get("/api/patients", (req, res) => {
  try {
    // Fixed Typo: 'patiens' -> 'patients'
    const result = db.execute("SELECT * from patients");
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /patients
app.post("/api/patients", (req, res) => {
  try {
    const { id, name, status } = req.body;

    if (!id || !name || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing fields! please provide id, name and status.",
      });
    }

    // Fixed the quote
    const sql = `INSERT INTO patients (id, name, status) VALUES ('${id}', '${name}', '${status}')`;
    const result = db.execute(sql);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- ☢️ DATABASE RESET BUTTON ☢️ ---
// Add this temporarily to fix the corrupted file
import fs from 'fs';
import path from 'path';

app.get('/api/reset-db', (req, res) => {
  try {
    // 1. Locate the file (it's usually in /data or ../data)
    // We try both common locations to be safe
    const pathsToCheck = [
      path.join(__dirname, 'data', 'patients.json'),
      path.join(__dirname, '../data', 'patients.json')
    ];

    let found = false;
    for (const p of pathsToCheck) {
      if (fs.existsSync(p)) {
        // Overwrite it with an empty list
        fs.writeFileSync(p, '[]'); 
        console.log(`✅ Wiped database at: ${p}`);
        found = true;
      }
    }

    if (found) {
      res.send("<h1>✅ Success! Database has been wiped clean.</h1><p>You can now go back and add patients.</p>");
    } else {
      res.send("<h1>⚠️ No database file found.</h1><p>The system might be clean already.</p>");
    }
  } catch (error: any) {
    res.status(500).send(`❌ Failed to reset: ${error.message}`);
  }
});
// --- START SERVER ---
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`\n✅ Server is running on port ${PORT}`);
  console.log(`   - Internal Address: http://0.0.0.0:${PORT}`);
});
