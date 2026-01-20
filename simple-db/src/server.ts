import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Database } from "./Database";

// Initializing the app
const app = express();
const PORT = process.env.PORT || 10000;

// 1. Fixed Typo: changed "daat" to "data"
const db = new Database("data");

// --- 2. CRITICAL FIX: Initialize Table on Startup ---
// This creates the patients.json file if it doesn't exist
try {
  db.execute(
    "CREATE TABLE patients (id, name, age, gender, diagnosis, status)"
  );
  console.log("✅ Database Table 'patients' checked/initialized.");
} catch (error) {
  console.log("ℹ️ Table initialization skipped (might already exist).");
}

app.use(cors());
app.use(bodyParser.json());

console.log("Starting Clinicalite backend...");

// ROOT URL check
app.get("/", (req, res) => {
  res.send("✅ Clinicalite API is Running!");
});

// --- R. READ (Get All Patients) ---
app.get("/api/patients", (req, res) => {
  try {
    //  get querry parameters (defults: page1, 10 items per page)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.serch as string || "").toLowerCase();

    // get all data 
    const result = db.execute("SELECT * from patients");
    let allPatients = result.data || [];

    // FILTER by Search term (ID or Name)
    if (search) {
      allPatients = allPatients.filter((p: { name: string; id: string; }) =>
        p.name.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search)
      );
    }

    // claculate the limit 'slices'
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // slice the data
    const paginatedPatients = allPatients.slice(startIndex, endIndex);

    // send back data + extra info for to frontend
    res.json({
      success: true,
      data: paginatedPatients,
      pagination: {
        total: allPatients.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(allPatients.length/ limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- C. CREATE (Admit Patient) ---
app.post("/api/patients", (req, res) => {
  try {
    // 3. Fixed: Extract ALL fields
    const { id, name, age, gender, diagnosis, status } = req.body;

    if (!id || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing fields! ID and Name are required.",
      });
    }

    // 4. Fixed: Save ALL fields to the database
    // Note: We use '${value}' to prevent the "Ghost Data" math bug
    const sql = `INSERT INTO patients (id, name, age, gender, diagnosis, status) VALUES ('${id}', '${name}', '${age}', '${gender}', '${diagnosis}', '${status}')`;

    console.log("📝 Executing:", sql); // Debug log
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

// --- U. UPDATE (Edit Patient) ---
//  Added: The missing route for your Edit Button
app.put("/api/patients", (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id)
      return res.status(400).json({ success: false, message: "ID required" });

    // Update the status
    const sql = `UPDATE patients SET status='${status}' WHERE id='${id}'`;
    const result = db.execute(sql);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- D. DELETE (Discharge Patient) ---
// Added: The missing route for your delete
app.delete("/api/patients/:id", (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM patients WHERE id='${id}'`;
    const result = db.execute(sql);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- START SERVER ---
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`\n✅ Server is running on port ${PORT}`);
  console.log(`   - Internal Address: http://0.0.0.0:${PORT}`);
});


