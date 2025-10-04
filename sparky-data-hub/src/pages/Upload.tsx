import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
} from 'lucide-react';
import { parseFile, createDataset, saveDataset } from '@/utils/fileParser';
import { downloadSampleData } from '@/utils/exportUtils';
import { toast } from 'sonner';

const Upload = () => {
  const navigate = useNavigate();
  const { dispatch, setActiveDataset } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const [datasetName, setDatasetName] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setDatasetName(uploadedFile.name.replace(/\.[^/.]+$/, ''));
      handleFileUpload(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleFileUpload = async (uploadedFile: File) => {
    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const data = await parseFile(uploadedFile);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setParsedData(data);
      toast.success('File parsed successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse file');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDataset = async () => {
    if (!parsedData || !datasetName.trim()) {
      toast.error('Please provide a dataset name');
      return;
    }

    try {
      const dataset = createDataset(datasetName.trim(), parsedData);
      saveDataset(dataset);
      dispatch({ type: 'ADD_DATASET', payload: dataset });
      await setActiveDataset(dataset.id);
      
      toast.success('Dataset saved successfully!');
      navigate('/data');
    } catch (error) {
      toast.error('Failed to save dataset');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Upload Dataset
          </h1>
          <p className="text-muted-foreground">
            Upload a CSV or Excel file to start analyzing your data
          </p>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>
              Drag and drop your file or click to browse. Maximum file size: 10MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-foreground">Drop your file here...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-foreground font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Supports CSV, XLSX, and XLS files
                  </p>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  {uploading ? (
                    <Badge variant="secondary">Processing...</Badge>
                  ) : parsedData ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Parsed
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>

                {uploading && (
                  <div className="mt-3">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Processing file... {progress}%
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={downloadSampleData}>
                <Download className="h-4 w-4 mr-2" />
                Download Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dataset Configuration */}
        {parsedData && (
          <Card>
            <CardHeader>
              <CardTitle>Dataset Configuration</CardTitle>
              <CardDescription>
                Configure your dataset before saving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="datasetName">Dataset Name</Label>
                <Input
                  id="datasetName"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Enter dataset name"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Rows</Label>
                  <div className="text-2xl font-bold text-foreground">
                    {parsedData.rows.length.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Columns</Label>
                  <div className="text-2xl font-bold text-foreground">
                    {parsedData.columns.length}
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveDataset} className="w-full" disabled={!datasetName.trim()}>
                Save Dataset & Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Data Preview */}
        {parsedData && (
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                First 50 rows of your dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {parsedData.columns.map((column: string) => (
                        <TableHead key={column} className="whitespace-nowrap">
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.rows.slice(0, 50).map((row: any, index: number) => (
                      <TableRow key={index}>
                        {parsedData.columns.map((column: string) => (
                          <TableCell key={column} className="whitespace-nowrap">
                            {row[column]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Upload;