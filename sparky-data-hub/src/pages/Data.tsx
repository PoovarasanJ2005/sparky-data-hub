import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowUpDown,
  Search,
  Filter,
  Trash2,
  Split,
  Save,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

const Data = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [splitColumn, setSplitColumn] = useState('');
  const [splitDelimiter, setSplitDelimiter] = useState(',');
  const [showSplitDialog, setShowSplitDialog] = useState(false);

  const activeDataset = state.activeDataset;

  const filteredAndSortedData = useMemo(() => {
    if (!activeDataset) return [];

    let data = [...activeDataset.rows];

    // Filter by search term
    if (searchTerm) {
      data = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort data
    if (sortColumn) {
      data.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === 'desc' ? -result : result;
      });
    }

    return data;
  }, [activeDataset, searchTerm, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(start, start + rowsPerPage);
  }, [filteredAndSortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const removeNullRows = () => {
    if (!activeDataset) return;

    const cleanedRows = activeDataset.rows.filter(row =>
      Object.values(row).some(value => value !== null && value !== undefined && value !== '')
    );

    const updatedDataset = {
      ...activeDataset,
      rows: cleanedRows,
      row_count: cleanedRows.length,
      cleaned: true,
    };

    // Update in local storage
    const datasets = JSON.parse(localStorage.getItem('sparkly_datasets') || '[]');
    const updatedDatasets = datasets.map((d: any) =>
      d.id === activeDataset.id ? updatedDataset : d
    );
    localStorage.setItem('sparkly_datasets', JSON.stringify(updatedDatasets));

    // Update state
    dispatch({ type: 'SET_DATASETS', payload: updatedDatasets });
    dispatch({ type: 'SET_ACTIVE_DATASET', payload: updatedDataset });

    toast.success(`Removed ${activeDataset.rows.length - cleanedRows.length} rows with null values`);
  };

  const handleSplitColumn = () => {
    if (!activeDataset || !splitColumn) return;

    const updatedRows = activeDataset.rows.map(row => {
      const value = row[splitColumn];
      if (typeof value === 'string' && value.includes(splitDelimiter)) {
        const parts = value.split(splitDelimiter);
        const newRow = { ...row };
        parts.forEach((part, index) => {
          newRow[`${splitColumn}_${index + 1}`] = part.trim();
        });
        return newRow;
      }
      return row;
    });

    // Add new columns to the dataset
    const maxParts = Math.max(
      ...activeDataset.rows.map(row => {
        const value = row[splitColumn];
        return typeof value === 'string' ? value.split(splitDelimiter).length : 1;
      })
    );

    const newColumns = [...activeDataset.columns];
    for (let i = 1; i <= maxParts; i++) {
      const newColName = `${splitColumn}_${i}`;
      if (!newColumns.includes(newColName)) {
        newColumns.push(newColName);
      }
    }

    const updatedDataset = {
      ...activeDataset,
      columns: newColumns,
      rows: updatedRows,
      cleaned: true,
    };

    // Update in local storage
    const datasets = JSON.parse(localStorage.getItem('sparkly_datasets') || '[]');
    const updatedDatasets = datasets.map((d: any) =>
      d.id === activeDataset.id ? updatedDataset : d
    );
    localStorage.setItem('sparkly_datasets', JSON.stringify(updatedDatasets));

    // Update state
    dispatch({ type: 'SET_DATASETS', payload: updatedDatasets });
    dispatch({ type: 'SET_ACTIVE_DATASET', payload: updatedDataset });

    setShowSplitDialog(false);
    toast.success(`Split column "${splitColumn}" into ${maxParts} parts`);
  };

  if (!activeDataset) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">No Active Dataset</h2>
            <p className="text-muted-foreground">
              Please upload a dataset first or select an active dataset from settings.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Data Explorer
          </h1>
          <p className="text-muted-foreground">
            Explore and clean your dataset: {activeDataset.name}
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Data Controls</CardTitle>
            <CardDescription>
              Search, filter, and clean your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Info */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search across all columns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">
                    {filteredAndSortedData.length.toLocaleString()}
                  </span>{' '}
                  rows
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    {activeDataset.columns.length}
                  </span>{' '}
                  columns
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={removeNullRows}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Null Rows
              </Button>

              <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Split className="h-4 w-4 mr-2" />
                    Split Column
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Split Column</DialogTitle>
                    <DialogDescription>
                      Split a column by a delimiter into multiple columns
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Column to Split</Label>
                      <Select value={splitColumn} onValueChange={setSplitColumn}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeDataset.columns.map(column => (
                            <SelectItem key={column} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Delimiter</Label>
                      <Input
                        value={splitDelimiter}
                        onChange={(e) => setSplitDelimiter(e.target.value)}
                        placeholder="Enter delimiter (e.g., comma, semicolon)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSplitDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSplitColumn} disabled={!splitColumn}>
                      Split Column
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {activeDataset.cleaned && (
                <Badge variant="secondary" className="ml-auto">
                  <Save className="h-3 w-3 mr-1" />
                  Cleaned
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset</CardTitle>
            <CardDescription>
              Showing {paginatedData.length} of {filteredAndSortedData.length} rows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeDataset.columns.map((column) => (
                      <TableHead
                        key={column}
                        className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column}</span>
                          <ArrowUpDown className="h-3 w-3" />
                          {sortColumn === column && (
                            <Badge variant="secondary" className="text-xs">
                              {sortDirection}
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index}>
                      {activeDataset.columns.map((column) => (
                        <TableCell key={column} className="whitespace-nowrap">
                          {row[column] === null || row[column] === undefined || row[column] === '' ? (
                            <span className="text-muted-foreground italic">null</span>
                          ) : (
                            String(row[column])
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Data;