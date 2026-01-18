// this is the main database class

import fs from "fs";
import path from "path";

type Schema = string[]; // e.g., ["id", "name", "status"]
type Row = Record<string, string>; // e.g., { id: "1", name: "John" }

export class Database {
  private tables: Map<string, { schema: Schema; data: Row[] }> = new Map();
  private dataDir: string;

  constructor(folderName: string) {
    // 1. Resolve path safely (Handles relative paths correctly)
    this.dataDir = path.join(process.cwd(), folderName);

    // 2. Ensure folder exists immediately
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log(`📂 Created database folder: ${this.dataDir}`);
    }

    // 3. Load existing tables from disk
    this.loadTables();
  }

  // --- CORE ENGINE ---

  public execute(sql: string): any {
    const command = sql.trim().split(" ")[0].toUpperCase();

    try {
      switch (command) {
        case "CREATE":
          return this.handleCreate(sql);
        case "INSERT":
          return this.handleInsert(sql);
        case "SELECT":
          return this.handleSelect(sql);
        case "DELETE":
          return this.handleDelete(sql);
        case "UPDATE":
          return this.handleUpdate(sql);
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // --- HANDLERS ---

  // Handles (CREATE Operation)
  private handleCreate(sql: string) {
    // Example: CREATE TABLE patients (id, name, status)
    const match = sql.match(/CREATE TABLE (\w+) \((.+)\)/i);
    if (!match)
      throw new Error("Syntax Error: CREATE TABLE table_name (col1, col2)");

    const tableName = match[1];
    const columns = match[2].split(",").map((c) => c.trim());

    if (this.tables.has(tableName)) {
      return { success: true, message: "Table already exists" };
    }

    // Create empty table in memory
    this.tables.set(tableName, { schema: columns, data: [] });

    // Save empty file to disk
    this.saveTable(tableName);

    return { success: true, message: `Table '${tableName}' created.` };
  }

  //  Handles inputing data (Create operation)
  private handleInsert(sql: string) {
    // Example: INSERT INTO patients (id, name) VALUES ('1', 'John')
    const match = sql.match(/INSERT INTO (\w+) \((.+)\) VALUES \((.+)\)/i);
    if (!match)
      throw new Error("Syntax Error: INSERT INTO table (cols) VALUES (vals)");

    const tableName = match[1];
    if (!this.tables.has(tableName))
      throw new Error(`Table '${tableName}' does not exist.`);

    const cols = match[2].split(",").map((c) => c.trim());
    // Remove quotes from values
    const vals = match[3].split(",").map((v) => v.trim().replace(/^'|'$/g, ""));

    const table = this.tables.get(tableName)!;

    // --- 🛡️ NEW: DUPLICATE CHECK GUARD 🛡️ ---
    // 1. Find the index of the "id" column
    const idIndex = cols.indexOf("id");

    // 2. If an ID was provided, check if it already exists in the table
    if (idIndex !== -1) {
      const newId = vals[idIndex];
      const duplicate = table.data.find((row) => row.id === newId);

      if (duplicate) {
        // ❌ REJECT THE INSERT
        throw new Error(
          `Duplicate Entry: Patient with ID '${newId}' already exists.`
        );
      }
    }

    const newRow: Row = {};

    // Map columns to values
    cols.forEach((col, index) => {
      newRow[col] = vals[index] || "";
    });

    table.data.push(newRow);
    this.saveTable(tableName); // Persist to disk

    return { success: true, message: "Row inserted.", data: newRow };
  }

  // Handles select
  private handleSelect(sql: string) {
    // Example: SELECT * from patients
    const match = sql.match(/SELECT \* from (\w+)/i);
    if (!match) throw new Error("Syntax Error: SELECT * from table");

    const tableName = match[1];
    if (!this.tables.has(tableName)) {
      // Auto-recovery: If table missing in memory but file exists, try reloading
      this.loadTables();
      if (!this.tables.has(tableName))
        throw new Error(`Table '${tableName}' does not exist.`);
    }

    return { success: true, data: this.tables.get(tableName)!.data };
  }
  // Handles (Delete operation)
  private handleDelete(sql: string) {
    // Example: DELETE FROM patients WHERE id='123'
    const match = sql.match(/DELETE FROM (\w+) WHERE (\w+)='(.+)'/i);
    if (!match)
      throw new Error("Syntax Error: DELETE FROM table WHERE col='val'");

    const [_, tableName, col, val] = match;
    if (!this.tables.has(tableName))
      throw new Error(`Table '${tableName}' does not exist.`);

    const table = this.tables.get(tableName)!;
    const originalLength = table.data.length;

    // Filter out the row
    table.data = table.data.filter((row) => row[col] !== val);

    if (table.data.length !== originalLength) {
      this.saveTable(tableName);
      return { success: true, message: "Row deleted." };
    }
    return { success: false, message: "No matching row found." };
  }
// Handles (UPDate Operation)
  private handleUpdate(sql: string) {
    // Example: UPDATE patients SET status='Admitted' WHERE id='123'
    const match = sql.match(
      /UPDATE (\w+) SET (\w+)='(.+)' WHERE (\w+)='(.+)'/i
    );
    if (!match)
      throw new Error(
        "Syntax Error: UPDATE table SET col='val' WHERE col='val'"
      );

    const [_, tableName, setCol, setVal, whereCol, whereVal] = match;
    if (!this.tables.has(tableName))
      throw new Error(`Table '${tableName}' does not exist.`);

    const table = this.tables.get(tableName)!;
    let updated = false;

    table.data = table.data.map((row) => {
      if (row[whereCol] === whereVal) {
        updated = true;
        return { ...row, [setCol]: setVal };
      }
      return row;
    });

    if (updated) {
      this.saveTable(tableName);
      return { success: true, message: "Row updated." };
    }
    return { success: false, message: "No matching row found." };
  }

  // --- FILE SYSTEM HELPERS ---

  private saveTable(tableName: string) {
    const filePath = path.join(this.dataDir, `${tableName}.json`);
    const tableData = this.tables.get(tableName)!.data;
    fs.writeFileSync(filePath, JSON.stringify(tableData, null, 2));
  }

  private loadTables() {
    if (!fs.existsSync(this.dataDir)) return;

    const files = fs.readdirSync(this.dataDir);
    files.forEach((file) => {
      if (file.endsWith(".json")) {
        const tableName = file.replace(".json", "");
        const content = fs.readFileSync(path.join(this.dataDir, file), "utf-8");
        try {
          const data = JSON.parse(content);
          // Infer schema from first row or default
          const schema = data.length > 0 ? Object.keys(data[0]) : [];
          this.tables.set(tableName, { schema, data });
          console.log(`📦 Loaded table: ${tableName} (${data.length} rows)`);
        } catch (e) {
          console.error(`⚠️ Failed to load ${file}: Corrupt JSON`);
        }
      }
    });
  }
};