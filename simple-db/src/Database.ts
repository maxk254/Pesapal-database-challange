// this is the main database class

import { Storage } from "./Storage";
import { Parser } from "./Parser";
import { Table } from "./Tables";
import { TableSchema,column,DataType, QueryResult,  } from "./types";

// database cordinates everything
// it handles sql commands and routes them to the right operations

export class Database {
  private storage: Storage; // saves the data
  private parser: Parser; // understands the command
  private tables: Map<string, Table> = new Map();

  constructor(dataDir: string = "./data") {
    this.storage = new Storage(dataDir);
    this.parser = new Parser();
    this.loadExistingTables();
  }

  // load tables that already exists on the disk
  private loadExistingTables(): void {
    const tableNames = this.storage.listTables();
    tableNames.forEach((name) => {
      const schema = this.storage.loadSchema(name);
      if (schema) {
        this.tables.set(name, new Table(this.storage, schema));
      }
    });
  }

  // executes any SQL commands
  execute(sql: string): QueryResult {
    try {
      const ast = this.parser.parse(sql);

      // route to appropriate handler based on command type
      if (ast.type === "create") {
        return this.handleCreate(ast);
      } else if (ast.type === "insert") {
        return this.handleInsert(ast);
      } else if (ast.type === "select") {
        return this.handleSelect(ast);
      } else if (ast.type === "update") {
        return this.handleUpdate(ast);
      } else if (ast.type === "delete") {
        return this.handleDelete(ast);
      } else {
        throw new Error(`Unsuppoted commnd: ${ast.type}`);
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
  private handleCreate(ast: any): QueryResult {
    const tableName = ast.table[0].table;

    const columns: column[] = ast.create_definitions.map((def: any) => {

      const rawType = def.definition?.dataType || def.definition?.type || "VARCHAR";

      return {
        name: def.column.column,
        type: String(rawType).toUpperCase() as DataType,
        isPrimaryKey: def.primary_key ? true : false,
        isUnique: def.unique_key ? true : false,
        maxLength: def.definition?.length,
      };
    });

    const schema: TableSchema = { name: tableName, columns };

    this.storage.saveSchema(tableName, schema);
    this.storage.saveData(tableName, []);
    this.tables.set(tableName, new Table(this.storage, schema));

    return {
      success: true,
      message: `Table '${tableName}' created successfully`,
    };
  }
  // private handleCreate(ast: any): QueryResult {
  //   // Extract table schema from AST
  //   const tableName = ast.table[0].table;
  //   const columns: column[] = ast.create_definitions.map((def: any) => ({
  //     name: def.column.column,
  //     type: def.definition.DataType.toUpperCase() as DataType,
  //     isPrimaryKey: def.primary_key,
  //     isUnique: def.unique_key,
  //     maxLength: def.definition.length,
  //   }));

  //   const schema: TableSchema = { name: tableName, columns };

  //   // save schema and create tables
  //   this.storage.saveSchema(tableName, schema);
  //   this.storage.saveData(tableName, []); // creates a  empty file
  //   this.tables.set(tableName, new Table(this.storage, schema));

  //   return {
  //     success: true,
  //     message: `Table '${tableName}' created successfully`,
  //   };
  // }

  private handleInsert(ast: any): QueryResult {
    const tableName = this.parser.getTableName(ast);
    const tables = this.getTable(tableName);

    const values = ast.values[0].value.map((v: any) => v.value);
    tables.insert(values);

    return {
      success: true,
      message: `1 row inserted into '${tableName}'`,
      rowCount: 1,
    };
  }

  private handleSelect(ast: any): QueryResult {
    const tableName = this.parser.getTableName(ast);
    const table = this.getTable(tableName);

    const columns =
      ast.columns === "*" ? ["*"] : ast.columns.map((c: any) => c.expr.column);

    // column= value
    let whereColumn, whereValue;
    if (ast.where) {
      whereColumn = ast.where.left.column;
      whereValue = ast.where.right.value;
    }

    const row = table.select(columns, whereColumn, whereValue);

    return {
      success: true,
      data: row,
      rowCount: row.length,
    };
  }

  private handleUpdate(ast: any): QueryResult {
    const tableName = this.parser.getTableName(ast);
    const table = this.getTable(tableName);

    const update: any = {};
    ast.set.forEach((s: any) => {
      update[s.column] = s.value.value;
    });
    const whereColumn = ast.where.left.column;
    const whereValue = ast.where.right.value;

    const count = table.update(update, whereColumn, whereValue);

    return {
      success: true,
      message: `${count} row(s) update`,
      rowCount: count,
    };
  }

  private handleDelete(ast: any): QueryResult {
    const tableName = this.parser.getTableName(ast);
    const table = this.getTable(tableName);

    const whereColumn = ast.where.left.column;
    const whereValue = ast.where.right.value;

    const count = table.delete(whereColumn, whereValue);

    return {
      success: true,
      message: `${count} row(s) deleted`,
      rowCount: count,
    };
  }

  private getTable(tableName: string): Table {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Tables '${tableName}' does not exist`);
    }
    return table;
  }
}