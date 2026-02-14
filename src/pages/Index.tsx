import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Database,
  BarChart3,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Download,
} from 'lucide-react';
import { downloadSampleData } from '@/utils/exportUtils';

const Index = () => {
  const navigate = useNavigate();
  const { state } = useApp();

  const stats = [
    {
      title: 'Total Datasets',
      value: state.datasets.length,
      icon: Database,
      color: 'text-blue-600',
    },
    {
      title: 'Active Dataset',
      value: state.activeDataset?.name || 'None',
      icon: FileText,
      color: 'text-green-600',
    },
    {
      title: 'Total Rows',
      value: state.activeDataset?.row_count || 0,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Last Updated',
      value: state.activeDataset?.created_at 
        ? new Date(state.activeDataset.created_at).toLocaleDateString()
        : 'Never',
      icon: Calendar,
      color: 'text-orange-600',
    },
  ];

  const quickActions = [
    {
      title: 'Upload Data',
      description: 'Upload a new CSV or Excel file',
      icon: Upload,
      action: () => navigate('/upload'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'View Data',
      description: 'Explore and clean your dataset',
      icon: Database,
      action: () => navigate('/data'),
      color: 'bg-green-500 hover:bg-green-600',
      disabled: !state.activeDataset,
    },
    {
      title: 'Analytics',
      description: 'Generate charts and insights',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: 'bg-purple-500 hover:bg-purple-600',
      disabled: !state.activeDataset,
    },
    {
      title: 'Download Sample',
      description: 'Get sample data to test with',
      icon: Download,
      action: downloadSampleData,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to Sparkly Data - your complete data analysis platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={action.action}
                  disabled={action.disabled}
                >
                  <action.icon className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Datasets */}
        {state.datasets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Datasets</CardTitle>
              <CardDescription>
                Your uploaded datasets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.datasets.slice(0, 5).map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">{dataset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {dataset.row_count.toLocaleString()} rows • {dataset.columns.length} columns
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {state.activeDataset?.id === dataset.id && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                      {dataset.cleaned && (
                        <Badge variant="outline">Cleaned</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started */}
        {state.datasets.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Start by uploading your first dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-muted-foreground">
                Upload a CSV or Excel file to begin analyzing your data
              </div>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate('/upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Dataset
                </Button>
                <Button variant="outline" onClick={downloadSampleData}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Index;