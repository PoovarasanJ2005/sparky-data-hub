import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Database,
  Trash2,
  Star,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { state, setActiveDataset, deleteDataset, updateSettings } = useApp();
  const [splitDelimiter, setSplitDelimiter] = useState(state.settings.split_delimiter);

  const handleSaveSettings = async () => {
    await updateSettings({
      split_delimiter: splitDelimiter,
    });
  };

  const handleSetActiveDataset = async (datasetId: string) => {
    await setActiveDataset(datasetId);
  };

  const handleDeleteDataset = async (datasetId: string) => {
    await deleteDataset(datasetId);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your application preferences and datasets
          </p>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Data Processing</CardTitle>
            <CardDescription>
              Configure how data is processed and cleaned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="delimiter">Default Split Delimiter</Label>
                <Input
                  id="delimiter"
                  value={splitDelimiter}
                  onChange={(e) => setSplitDelimiter(e.target.value)}
                  placeholder="Enter delimiter (e.g., comma, semicolon)"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Default delimiter used when splitting columns
                </p>
              </div>
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dataset Management */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Management</CardTitle>
            <CardDescription>
              Manage your uploaded datasets and set the active dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.datasets.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No datasets uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground flex items-center space-x-2">
                          <span>{dataset.name}</span>
                          {state.activeDataset?.id === dataset.id && (
                            <Badge variant="default">
                              <Star className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {dataset.cleaned && (
                            <Badge variant="secondary">Cleaned</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-4">
                          <span>{dataset.row_count.toLocaleString()} rows</span>
                          <span>{dataset.columns.length} columns</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(dataset.created_at).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {state.activeDataset?.id !== dataset.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetActiveDataset(dataset.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{dataset.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDataset(dataset.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Info */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>
              About Sparkly Data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-foreground">Version</div>
                  <div className="text-muted-foreground">1.0.0</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Last Updated</div>
                  <div className="text-muted-foreground">{new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Supported Formats</div>
                  <div className="text-muted-foreground">CSV, XLSX, XLS</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Max File Size</div>
                  <div className="text-muted-foreground">10 MB</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Sparkly Data is a comprehensive data analysis platform built with React, TypeScript, and modern web technologies.
                  Upload your data, clean it, analyze it, and visualize your insights with powerful charts and export capabilities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;