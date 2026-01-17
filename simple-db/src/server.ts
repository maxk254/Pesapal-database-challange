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

    // Fixed Typo: 'INSER' -> 'INSERT'
    const sql = `INSERT INTO patients (id, name, status) VALUES (${id}, '${name}', '${status}')`;
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

// --- START SERVER ---
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`\n✅ Server is running on port ${PORT}`);
  console.log(`   - Internal Address: http://0.0.0.0:${PORT}`);
});
// import express from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import { Database } from './Database';

// // Initializing the app
// const app = express();

// const PORT = process.env.PORT || 10000;

// // Initializing Database
// const db = new Database ('daat');

// // middleeware
// app.use(cors); // allows request from anywhere
// app.use(bodyParser.json());

// console.log("Start Clincalite backend");

// // ROOT URL check (to know if our backend is working)
// app.get('/', (req, res) => {
//   res.send("✅ Clinicalite API is Running!");
// });

// // GET /Patients -- "give the ward report"
// app.get('/api/patients', (req, res) =>{
//     try {
//       const result= db.execute("SELECT * from patiens");
//       res.json(result);
//     } catch (error:any) {
//         res.status(500).json({success:false, message: error.message});
//     }
// });

// // POST /patients  -- "Admit a new patient"
// app.post('/api/patients', (req, res) => {
//   try{
//     const {id, name, status} = req.body;

//     if (!id || !name || !status) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing fields ! pleas provide id, name and status."
//       });
//     }

//     const sql = `INSER INTO patients (id, name, status) VALUES (${id}, '${name}', '${status}')`;
//     const result = db.execute(sql);

//     if (result.success) {
//       res.json(result);
//     } else {
//         res.status(400).json(result);
//     }
//   } catch (error:any) {
//     res.status(500).json({success:false, message: error.message});
//   }
// });

// // --- START SERVER ---
// // We convert PORT to a number and explicitly listen on '0.0.0.0' for Render
// // const portNumber = Number(PORT);

// app.listen(Number(PORT), '0.0.0.0', () => {
//     console.log(`\n✅ Server is running on port ${PORT}`);
//     // console.log(`   - Internal Address: http://0.0.0.0:${portNumber}`);
// });
