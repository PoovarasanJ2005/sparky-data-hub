import { Dataset } from '@/contexts/AppContext';

export interface ColumnSummary {
  column: string;
  type: 'string' | 'number' | 'date';
  count: number;
  nullCount: number;
  uniqueCount: number;
  mean?: number;
  median?: number;
  min?: number | string;
  max?: number | string;
  std?: number;
}

export interface DataSummary {
  totalRows: number;
  totalColumns: number;
  columnSummaries: ColumnSummary[];
}

export function calculateSummaryStats(dataset: Dataset): DataSummary {
  const columnSummaries: ColumnSummary[] = dataset.columns.map(column => {
    const values = dataset.rows.map(row => row[column]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const nullCount = values.length - nonNullValues.length;
    
    // Determine type
    const numericValues = nonNullValues.filter(v => !isNaN(Number(v))).map(v => Number(v));
    const isNumeric = numericValues.length === nonNullValues.length && nonNullValues.length > 0;
    
    const summary: ColumnSummary = {
      column,
      type: isNumeric ? 'number' : 'string',
      count: nonNullValues.length,
      nullCount,
      uniqueCount: new Set(nonNullValues).size,
    };
    
    if (isNumeric && numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const mean = sum / numericValues.length;
      
      summary.mean = mean;
      summary.median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      summary.min = Math.min(...numericValues);
      summary.max = Math.max(...numericValues);
      
      // Standard deviation
      const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
      summary.std = Math.sqrt(variance);
    } else if (nonNullValues.length > 0) {
      summary.min = String(nonNullValues[0]);
      summary.max = String(nonNullValues[nonNullValues.length - 1]);
    }
    
    return summary;
  });
  
  return {
    totalRows: dataset.rows.length,
    totalColumns: dataset.columns.length,
    columnSummaries,
  };
}

export function getColumnValues(dataset: Dataset, column: string): any[] {
  return dataset.rows.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');
}

export function groupData(dataset: Dataset, groupBy: string, aggregateColumn: string, aggregateFunction: 'count' | 'sum' | 'avg' | 'min' | 'max'): Array<{ group: string; value: number }> {
  const groups = new Map<string, any[]>();
  
  dataset.rows.forEach(row => {
    const groupValue = String(row[groupBy] || 'Unknown');
    if (!groups.has(groupValue)) {
      groups.set(groupValue, []);
    }
    groups.get(groupValue)!.push(row[aggregateColumn]);
  });
  
  const result: Array<{ group: string; value: number }> = [];
  
  groups.forEach((values, group) => {
    let value = 0;
    const numericValues = values.filter(v => !isNaN(Number(v))).map(v => Number(v));
    
    switch (aggregateFunction) {
      case 'count':
        value = values.length;
        break;
      case 'sum':
        value = numericValues.reduce((acc, val) => acc + val, 0);
        break;
      case 'avg':
        value = numericValues.length > 0 ? numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length : 0;
        break;
      case 'min':
        value = numericValues.length > 0 ? Math.min(...numericValues) : 0;
        break;
      case 'max':
        value = numericValues.length > 0 ? Math.max(...numericValues) : 0;
        break;
    }
    
    result.push({ group, value });
  });
  
  return result.sort((a, b) => b.value - a.value);
}

export function filterData(dataset: Dataset, filters: Record<string, any>): Dataset {
  const filteredRows = dataset.rows.filter(row => {
    return Object.entries(filters).every(([column, value]) => {
      if (value === '' || value === null || value === undefined) return true;
      return String(row[column]).toLowerCase().includes(String(value).toLowerCase());
    });
  });
  
  return {
    ...dataset,
    rows: filteredRows,
    row_count: filteredRows.length,
  };
}