import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { calculateSummaryStats, groupData } from '@/utils/dataAnalysis';
import { exportToPNG, exportToPDF, exportToCSV, exportToExcel } from '@/utils/exportUtils';
import {
  BarChart3,
  LineChart,
  PieChart,
  Download,
  FileImage,
  FileText,
  Table2,
} from 'lucide-react';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const Analytics = () => {
  const { state } = useApp();
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [groupColumn, setGroupColumn] = useState('');
  const [valueColumn, setValueColumn] = useState('');
  const [aggregateFunction, setAggregateFunction] = useState<'count' | 'sum' | 'avg' | 'min' | 'max'>('count');

  const activeDataset = state.activeDataset;

  const summaryStats = useMemo(() => {
    return activeDataset ? calculateSummaryStats(activeDataset) : null;
  }, [activeDataset]);

  const chartData = useMemo(() => {
    if (!activeDataset || !groupColumn) return null;

    const data = groupData(activeDataset, groupColumn, valueColumn || groupColumn, aggregateFunction);
    
    const labels = data.map(d => d.group);
    const values = data.map(d => d.value);

    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(6, 182, 212, 0.8)',
      'rgba(34, 197, 94, 0.8)',
    ];

    return {
      labels: labels.slice(0, 10), // Limit to top 10
      datasets: [
        {
          label: `${aggregateFunction} of ${valueColumn || groupColumn}`,
          data: values.slice(0, 10),
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    };
  }, [activeDataset, groupColumn, valueColumn, aggregateFunction]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart - ${groupColumn}`,
      },
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  const handleExport = async (type: 'png' | 'pdf' | 'csv' | 'excel') => {
    if (!activeDataset) return;

    try {
      switch (type) {
        case 'png':
          await exportToPNG('analytics-dashboard', `${activeDataset.name}-analytics.png`);
          break;
        case 'pdf':
          await exportToPDF('analytics-dashboard', `${activeDataset.name}-analytics.pdf`);
          break;
        case 'csv':
          exportToCSV(activeDataset, `${activeDataset.name}.csv`);
          break;
        case 'excel':
          exportToExcel(activeDataset, `${activeDataset.name}.xlsx`);
          break;
      }
      toast.success(`Exported as ${type.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export as ${type.toUpperCase()}`);
    }
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

  const numericColumns = activeDataset.columns.filter(col => {
    const values = activeDataset.rows.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
    return values.some(v => !isNaN(Number(v)));
  });

  return (
    <Layout>
      <div id="analytics-dashboard" className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Analyze and visualize your dataset: {activeDataset.name}
          </p>
        </div>

        {/* Export Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Download your analytics and data in various formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => handleExport('png')}>
                <FileImage className="h-4 w-4 mr-2" />
                Export as PNG
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <Table2 className="h-4 w-4 mr-2" />
                Export as Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        {summaryStats && (
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>
                Overview of your dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {summaryStats.totalRows.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {summaryStats.totalColumns}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Columns</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {summaryStats.columnSummaries.filter(c => c.type === 'number').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Numeric Columns</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Column Statistics */}
        {summaryStats && (
          <Card>
            <CardHeader>
              <CardTitle>Column Statistics</CardTitle>
              <CardDescription>
                Detailed statistics for each column
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryStats.columnSummaries.map((col) => (
                  <div key={col.column} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">{col.column}</h4>
                      <Badge variant={col.type === 'number' ? 'default' : 'secondary'}>
                        {col.type}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Count</div>
                        <div className="font-medium text-foreground">{col.count.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Null Count</div>
                        <div className="font-medium text-foreground">{col.nullCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Unique Values</div>
                        <div className="font-medium text-foreground">{col.uniqueCount.toLocaleString()}</div>
                      </div>
                      {col.type === 'number' && col.mean !== undefined && (
                        <>
                          <div>
                            <div className="text-muted-foreground">Mean</div>
                            <div className="font-medium text-foreground">{col.mean.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Median</div>
                            <div className="font-medium text-foreground">{col.median?.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Min</div>
                            <div className="font-medium text-foreground">{col.min}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Max</div>
                            <div className="font-medium text-foreground">{col.max}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Std Dev</div>
                            <div className="font-medium text-foreground">{col.std?.toFixed(2)}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
            <CardDescription>
              Create interactive charts from your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Chart Type</label>
                <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Bar Chart</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center space-x-2">
                        <LineChart className="h-4 w-4" />
                        <span>Line Chart</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center space-x-2">
                        <PieChart className="h-4 w-4" />
                        <span>Pie Chart</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Group By</label>
                <Select value={groupColumn} onValueChange={setGroupColumn}>
                  <SelectTrigger className="mt-1">
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
                <label className="text-sm font-medium text-foreground">Value Column</label>
                <Select value={valueColumn} onValueChange={setValueColumn}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {numericColumns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Aggregation</label>
                <Select value={aggregateFunction} onValueChange={(value: any) => setAggregateFunction(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Display */}
        {chartData && groupColumn && (
          <Card>
            <CardHeader>
              <CardTitle>Chart</CardTitle>
              <CardDescription>
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart showing {aggregateFunction} of {valueColumn || groupColumn} by {groupColumn}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
                {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
                {chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;