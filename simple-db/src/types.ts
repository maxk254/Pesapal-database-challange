//this is for the typescript types

export enum Datatype{
  INT = "INT",
  VARCHAR = 'VARCHAR',
  TEXT = "TEXT",
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN'
}

export interface column {
  name: string;
  type: Datatype;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  maxLength?: number;

}

export interface TableSchema {
  name: string;
  columns: column[];
}

export interface Row {
  [key: string] : any;
}

export interface QueryResult {
  success: boolean;
  data?: Row[];
  message?: string;
  rowCount?: number;
}

export interface WhereCondition {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<='
}