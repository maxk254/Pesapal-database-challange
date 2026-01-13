// this is the indexing logic file

import { Row } from "./types";

// Index provides faster lookups using a hash map
// maps column value to row induces

export class Index {
  private map: Map<any, number[]> = new Map();

  // build index from all rows
  build(rows: Row[], columnName: string): void {
    this.map.clear();  // stsrst fresh. Erase old index

    rows.forEach((row, rowIndex) => {  // loops through every single row
      const value = row[columnName];  // this grabs the value in the rows

      if (!this.map.has(value)) {
        this.map.set(value, []);
      }

      this.map.get(value)!.push(rowIndex);
    });
  }

  // finds which row have this value {this selects querry faster }
  lookup(value:any): number[] {
    return this.map.get(value) || [];
  }

  // checks if  value exists (for uniqueness check)  prevents duplication of data and returns an errors
  exists(value:any): boolean {
    return this.map.has(value)
  }
}