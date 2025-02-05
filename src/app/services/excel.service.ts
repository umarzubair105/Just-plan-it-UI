import * as XLSX from 'xlsx';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  constructor() {}
  private readonly COLUMN_MAPPING: { [key: string]: string } = {
    "Code": "cc",
    "Help Text": "desc",
    "Description": "desp",
    "Designation": "designation"
  };
  readExcelFile(file: File): Promise<{ headers: string[], data: any[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first sheet name
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
/*
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData);
*/
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[]; // Extract headers (first row)
          const dataRows = XLSX.utils.sheet_to_json(sheet); // Extract data
          resolve({ headers, data: dataRows });
        } else {
          reject("No data found in the Excel file.");
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /*readExcelFileWithMapping(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert Excel data to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Apply mapping to transform data
        const mappedData = jsonData.map((row: any) => this.mapColumns(row));

        resolve(mappedData);
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }*/

  mapJsonData(jsonData: any[],mapping: any): any {
    return jsonData.map((row: any) => this.mapColumns(row, mapping));
  }
  private mapColumns(row: any, mapping: any): any {
    let transformedRow: any = {};
    Object.keys(row).forEach((key) => {
      const mappedKey = mapping[key]; // Check if the column name is mapped
      if (mappedKey) {
        transformedRow[mappedKey] = row[key];
      }
    });
    return transformedRow;
  }

/*  private mapColumns(row: any): any {
    let transformedRow: any = {};
    Object.keys(row).forEach((key) => {
      const mappedKey = this.COLUMN_MAPPING[key]; // Check if the column name is mapped
      if (mappedKey) {
        transformedRow[mappedKey] = row[key];
      }
    });
    return transformedRow;
  }*/
}
