import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Dataset } from '@/contexts/AppContext';

export interface ParsedData {
  columns: string[];
  rows: Record<string, any>[];
}

export function sanitizeColumnName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

export function inferColumnType(values: any[]): 'string' | 'number' | 'date' {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'string';
  
  // Check if all are numbers
  const numericValues = nonNullValues.filter(v => !isNaN(Number(v)));
  if (numericValues.length === nonNullValues.length) return 'number';
  
  // Check if all are dates
  const dateValues = nonNullValues.filter(v => !isNaN(Date.parse(v)));
  if (dateValues.length === nonNullValues.length) return 'date';
  
  return 'string';
}

export function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: sanitizeColumnName,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message));
          return;
        }
        
        const columns = results.meta.fields || [];
        const rows = results.data as Record<string, any>[];
        
        resolve({ columns, rows });
      },
      error: (error) => reject(error),
    });
  });
}

export function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          reject(new Error('No data found in the file'));
          return;
        }
        
        const firstRow = jsonData[0] as Record<string, any>;
        const columns = Object.keys(firstRow).map(sanitizeColumnName);
        
        const rows = jsonData.map((row: any) => {
          const sanitizedRow: Record<string, any> = {};
          Object.entries(row).forEach(([key, value]) => {
            sanitizedRow[sanitizeColumnName(key)] = value;
          });
          return sanitizedRow;
        });
        
        resolve({ columns, rows });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
  }
}

export function createDataset(name: string, data: ParsedData): Dataset {
  return {
    id: crypto.randomUUID(),
    name,
    columns: data.columns,
    rows: data.rows,
    created_at: new Date().toISOString(),
    cleaned: false,
    row_count: data.rows.length,
  };
}

export function saveDataset(dataset: Dataset): void {
  const datasets = JSON.parse(localStorage.getItem('sparkly_datasets') || '[]');
  datasets.push(dataset);
  localStorage.setItem('sparkly_datasets', JSON.stringify(datasets));
}