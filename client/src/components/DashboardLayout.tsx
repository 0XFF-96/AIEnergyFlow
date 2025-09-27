import { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Zap, BarChart3 } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  alerts?: ReactNode;
}

export function DashboardLayout({ children, alerts }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Zap className="h-6 w-6 text-primary" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-none">Energy Management</h1>
              </div>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 flex items-center">
              <Activity className="h-3 w-3 mr-1.5" />
              Live
            </Badge>
          </div>
          
          <div className="flex flex-1 items-center justify-end">
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span className="leading-none">AI Monitoring Active</span>
              </div>
              <ThemeToggle />
            </div>
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