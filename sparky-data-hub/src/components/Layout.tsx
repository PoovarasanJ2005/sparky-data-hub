import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { ThemeToggle } from './ThemeToggle';
import {
  Home,
  Upload,
  Database,
  BarChart3,
  Settings,
  Sparkle,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { state } = useApp();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/data', label: 'Data', icon: Database },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkle className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Sparkly Data</span>
            </Link>
            {state.activeDataset && (
              <div className="hidden md:block text-sm text-muted-foreground">
                Active: <span className="font-medium text-foreground">{state.activeDataset.name}</span>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6 overflow-x-auto">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center space-x-2 py-3 px-2 text-sm font-medium transition-colors whitespace-nowrap",
                  location.pathname === path
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}