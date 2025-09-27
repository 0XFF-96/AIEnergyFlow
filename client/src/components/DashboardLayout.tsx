import { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Activity, Zap, BarChart3, Bell, Settings } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  alerts?: ReactNode;
  alertCount?: number;
  onAlertCenterClick?: () => void;
  onSystemClick?: () => void;
  userRole?: string;
  microgridLocation?: string;
}

export function DashboardLayout({ 
  children, 
  alerts, 
  alertCount = 0, 
  onAlertCenterClick, 
  onSystemClick,
  userRole,
  microgridLocation 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Left side - Logo and current page */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold leading-none">EcoPlus</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              Dashboard
            </Badge>
          </div>

          {/* Center - Role and Location info */}
          <div className="flex-1 flex items-center justify-center">
            {(userRole || microgridLocation) && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Role:</span>
                <span className="text-orange-400 font-medium">
                  {userRole === 'community' ? 'Community Member' : 'Operator'}
                </span>
                <span className="text-muted-foreground">@</span>
                <span className="text-white">
                  {microgridLocation && microgridLocation.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            )}
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-3">
            {onSystemClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSystemClick}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>System</span>
              </Button>
            )}
            
            {onAlertCenterClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAlertCenterClick}
                className="flex items-center space-x-2 bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 relative"
              >
                <Bell className="h-4 w-4" />
                <span>Alert Centre</span>
                {alertCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{alertCount}</span>
                  </div>
                )}
              </Button>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Alerts Section */}
      {alerts && (
        <div className="border-b border-border/40 bg-background/50">
          <div className="container py-4">
            {alerts}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50">
        <div className="container py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
            <div className="flex items-center space-x-4">
              <span>Microgrid Status: Online</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}