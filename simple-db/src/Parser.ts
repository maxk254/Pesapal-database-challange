// the sql parsing 
// parser converts sql text into strucured commands
// i used node-sql-parser library to do the heavy lifting (i installed it)
import { Parser as SQLParser } from "node-sql-parser";


export class Parser {
  private parser: SQLParser;

  constructor() {
    this.parser = new SQLParser();
  }

  parse(sql: string): any {
    try {
      // parser SQL into Abstract Syntax Tree
      const ast = this.parser.astify(sql);
      return ast;
    } catch (errors: any) {
      throw new Error(`SQL parsing error: ${errors.message}`);
    }
  }

  // helper to extract tables names from AST 
  getTableName(ast: any): string {
    if (ast.table) {
      // sometimes its an array sometimes a single object
      if (Array.isArray(ast.table)) {
        return ast.table[0].table;
      }
      return ast.table;
    }

    // case 2 : select uses from
    if (ast.from) {
      return ast.from[0].table;
    }
    throw new Error('could not extract tables names')
  }
}
