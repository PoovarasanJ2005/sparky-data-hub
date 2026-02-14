import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Dataset } from '@/contexts/AppContext';

export async function exportToPNG(elementId: string, filename: string = 'export.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
}

export async function exportToPDF(elementId: string, filename: string = 'export.pdf'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(filename);
}

export function exportToCSV(dataset: Dataset, filename: string = 'export.csv'): void {
  const headers = dataset.columns.join(',');
  const rows = dataset.rows.map(row => 
    dataset.columns.map(col => {
      const value = row[col];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function exportToExcel(dataset: Dataset, filename: string = 'export.xlsx'): void {
  const worksheet = XLSX.utils.json_to_sheet(dataset.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  XLSX.writeFile(workbook, filename);
}

export function downloadSampleData(): void {
  const sampleData = {
    columns: ['id', 'name', 'age', 'department', 'salary', 'join_date'],
    rows: [
      { id: 1, name: 'John Doe', age: 30, department: 'Engineering', salary: 75000, join_date: '2022-01-15' },
      { id: 2, name: 'Jane Smith', age: 28, department: 'Marketing', salary: 65000, join_date: '2022-03-10' },
      { id: 3, name: 'Bob Johnson', age: 35, department: 'Engineering', salary: 85000, join_date: '2021-11-20' },
      { id: 4, name: 'Alice Brown', age: 32, department: 'Sales', salary: 70000, join_date: '2022-02-28' },
      { id: 5, name: 'Charlie Wilson', age: 29, department: 'Marketing', salary: 60000, join_date: '2022-04-05' },
      { id: 6, name: 'Diana Davis', age: 31, department: 'HR', salary: 68000, join_date: '2022-01-08' },
      { id: 7, name: 'Edward Miller', age: 33, department: 'Engineering', salary: 80000, join_date: '2021-12-15' },
      { id: 8, name: 'Fiona Garcia', age: 27, department: 'Sales', salary: 72000, join_date: '2022-03-22' },
    ]
  };
  
  const headers = sampleData.columns.join(',');
  const rows = sampleData.rows.map(row => 
    sampleData.columns.map(col => row[col as keyof typeof row]).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'sample-data.csv';
  link.click();
}