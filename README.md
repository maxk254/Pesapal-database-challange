# 🏥 ClinicaLite DB (Custom SQL Engine)

ClinicaLite is a lightweight, relational database engine built from scratch in **TypeScript* and *NODE**

I built this project to understand the internal architecture of Database Management Systems (DBMS). Unlike standard wrappers around SQL libraries, this engine implements its own storage layer, command parser, and data integrity checks.

## 🚀 Key Features

* **Custom SQL Parser:** Converts raw SQL text into an **Abstract Syntax Tree (AST)** to understand commands using `node-sql-parser`.
* **Persistent Storage:** Implements a custom file-based storage engine (simulating disk I/O) using JSON serialization.
* **Data Integrity:** Enforces **Primary Key constraints** to prevent duplicate records (demonstrated with Patient IDs).
* **Type Safety:** Built entirely in **TypeScript** for compile-time error checking and robust architecture.
* **Interactive REPL:** Includes a live command-line interface (CLI) to query the database in real-time.

## 🛠️ Architecture

The system is modularized into three core components:

1.  **The Parser (`Parser.ts`):** The "Brain." It accepts SQL strings and breaks them down into structured commands.
2.  **The Database Engine (`Database.ts`):** The "Controller." It orchestrates the flow of data, handles logic (like CREATE, INSERT, SELECT), and ensures schema validation.
3.  **The Storage Layer (`Storage.ts`):** The "Muscle." It handles reading and writing data to the disk, ensuring data persists even after the program stops.

## 💻 How to Run

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install

### HOW TO RUN Automamted Test
npm run test

### How to launch Interactive Terminal (REPL)
npm run dev

### Supported SQL Commands
CREATE TABLE patients (id INT PRIMARY KEY, name VARCHAR, status VARCHAR)
INSERT INTO patients (id, name, status) VALUES (101, 'John Doe', 'Sick')
SELECT * FROM patients

### Technical Highlights
## 1. Handling Concurrency: The engine currently runs effectively in a single-threaded Node.js environment.

## 2. AST Traversal: I learned how to traverse complex JSON trees to extract table names and column definitions dynamically.

## 2. Error Handling: The system gracefully handles syntax errors and constraint violations (e.g., trying to insert a duplicate Primary Key) without crashing.

Built by [MAXWEL GEOFREY KAMAU] - Medical Student and Software Developer.
