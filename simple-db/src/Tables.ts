import { Storage } from "./Storage";
import { Index } from "./Indexer"; // speeds up the llokup process(the search)
import { TableSchema, Row, column, DataType } from "./types";


// each table handles all operations onna single table
// each table has a schema (structure) and rows (the data)

export class Table {
  private storage: Storage;
  private schema: TableSchema;
  private index: Map<string, Index> = new Map();

  constructor(storage: Storage, schema: TableSchema) {
    this.storage = storage;
    this.schema = schema;
    this.buildIndexes();
  }

      
  // creates indexes for primary and unique columns
  private buildIndexes(): void {
    const rows = this.storage.loadData(this.schema.name);

    this.schema.columns.forEach(col => {
      if(col.isPrimaryKey || col.isUnique) {
        const index = new Index();
        index.build(rows, col.name);
        this.index.set(col.name, index);
      }
    });
  }

  // inserts a new row
  insert(value: any[]): void {

    // validates data types
    this.validateTypes(value);

    // checks primary key, uniquqeness
    this.validateConstraints(value);

    // converts array to object 
    const row: Row = {};
    this.schema.columns.forEach((col, i) =>{
      row[col.name] = value[i];
    });

    // adding the data to the storage (saves to the disk)
    const rows = this.storage.loadData(this.schema.name);
    rows.push(row);
    this.storage.saveData(this.schema.name, rows);
        
    //updates indexes
    this.buildIndexes();
  }

  // seelct rows (with optional where filter)
  select(columns: string[], whereColumn?: string, whereValue?: any): Row[] {
    let rows = this.storage.loadData(this.schema.name);

    // filter by WHERE if provided 
    if (whereColumn && whereValue !== undefined) {
      rows = rows.filter(row => row[whereColumn] === whereValue);
    }

    // select specific columns or all (*)
    if (columns[0] !== '*') {
      rows = rows.map(row => {
        const filtered: Row = {};
        columns.forEach(col => filtered[col] = row[col]);
        return filtered;
      });
    }

    return rows;
  }
  // updates rows
  update(updates: Row, whereColumn: string, whereValue: any): number {
    const rows = this.storage.loadData(this.schema.name);
    let updated = 0;

    rows.forEach(row =>{
      if (row[whereColumn] === whereValue) {
        Object.keys(updates).forEach(col => {
          row[col] = updates[col];
        });
        updated++;
      }
    });

    this.storage.saveData(this.schema.name, rows);
    this.buildIndexes();

    return updated;
  }

  // DELETE rows
  delete(whereColumn: string, whereValue: any): number {
    const rows = this.storage.loadData(this.schema.name);
    const originalCount = rows.length;

    const remaining = rows.filter(row => row[whereColumn] !== whereValue);

    this.storage.saveData(this.schema.name, remaining);
    this.buildIndexes();

    return originalCount- remaining.length;
  }

  // validate data types match schema
  private validateTypes(values: any[]): void {
    this.schema.columns.forEach((col, i) =>{
      const value = values[i];

      if (col.type === DataType.INT && !Number.isInteger(value)) {
        throw new Error(`column ${col.name} expect INT`);
      }

      if(col.type === DataType.VARCHAR) {
        if (typeof value !== 'string') {
          throw new Error(`Column ${col.name} expect VARCHAR`);
        }
        if (col.maxLength && value.length > col.maxLength) {
          throw new Error(`Column ${col.name} exceeds max length ${col.maxLength}`);
        }
      }
    });
  }

  // validates primary key and unique constraints
  private validateConstraints(values: any[]): void {
    this.schema.columns.forEach((col, i) => {
      const value = values[i];
      const index = this.index.get(col.name);

      if (col.isPrimaryKey) {
        if (value === null || value === undefined) {
          throw new Error(`PRIMARY KEY ${col.name} cannot be NULL`);
        }
        // primary key mus be unique
        if (index && index.exists(value)) {
          throw new Error(`PRIMARY KEY violation ${col.name}=${value} already exists`);
        }
      }

      if (col.isUnique && value !== null) {
        if (index && index.exists(value)) {
          throw new Error(`UNIQUE constraint violation: ${col.name}=${value}`);
        }
      }
    });
  }
}