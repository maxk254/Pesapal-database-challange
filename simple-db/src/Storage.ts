// this is the file check for reading and writing data

import fs from 'fs';
import path from 'path'; 
import { Row, TableSchema } from './types';

// storage handles reading  and writing data to JSON file

export class storage {
  private dataDir: string;

  constructor(dataDir: string = "./data") {
    this.dataDir = dataDir;
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

// exact location for the users folder
  // private getTablePath(tableName: string): string {
  //   return path.join(this.dataDir, `${tableName}.json`)
  // }


  // // exact organization of the folder
  // private getSchemaPath(tableNmae: string): string {
  //   return path.join(this.dataDir, `${tableName}.schema.json`);
  // }

  // save table structure
  saveSchema(tableName: string, schema: TableSchema): void {
    const schemaPath = path.join(this.dataDir, `${tableName}.schema.json`);
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
  }

  // load table structure
  loadSchema(tableName: string): TableSchema | null {
    const schemaPath = path.join(this.dataDir, `${tableName}.schema.json`);
    if (!fs.existsSync(schemaPath)) return null;

    const data = fs.readFileSync(schemaPath, 'utf-8');
    return JSON.parse(data);
  }

  //saves table rows
  saveData(tableName: string, rows: Row[]): void {
    const datapath = path.join(this.dataDir, `${tableName}.json`);
    fs.writeFileSync(datapath, JSON.stringify(rows, null, 2));
  }

  // loads table rows 
  loadData (tableName: string): Row[] {
    const dataPath = path.join(this.dataDir, `${tableName}.json`);
    if (!fs.existsSync(dataPath)) return [];

    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  }
  
  // check if tables exists
  tableExist(tableName: string): boolean {
    const schemaPath = path.join(this.dataDir, `${tableName}.schema.json`);
    return fs.existsSync(schemaPath);
  }

  // list all tables
  listTables() : string[] {
    const files = fs.readdirSync(this.dataDir);
    return files
    .filter(f => f.endsWith('.schema.json'))
    .map(f => f.replace('.schema.json', ''));
  }
}