import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bell, Eye, Clock, CheckCircle, X, AlertCircle, TrendingUp, Filter, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity?: 'info' | 'warning' | 'critical';
  type: string;
  timestamp: Date | string | number;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  source: string;
  deviceId?: string;
  location?: string;
}

interface AlertDashboardProps {
  alerts: Alert[];
  onAlertAction: (alertId: string, action: string) => void;
  onViewAll: () => void;
}

interface AlertStats {
  total: number;
  active: number;
  critical: number;
  warning: number;
  info: number;
  resolved: number;
  averageResponseTime: number;
}

export function AlertDashboard({ alerts, onAlertAction, onViewAll }: AlertDashboardProps) {
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    active: 0,
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0,
    averageResponseTime: 15
  });
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  useEffect(() => {
    // Get recent alerts (last 5)
    const recent = alerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    setRecentAlerts(recent);
    
    // Count unresolved alerts
    const unresolved = alerts.filter(alert => 
      alert.status === 'active' || alert.status === 'acknowledged'
    ).length;
    setUnresolvedCount(unresolved);
    
    // Calculate alert statistics
    const newStats: AlertStats = {
      total: alerts.length,
      active: alerts.filter(alert => alert.status === 'active').length,
      critical: alerts.filter(alert => alert.severity === 'critical').length,
      warning: alerts.filter(alert => alert.severity === 'warning').length,
      info: alerts.filter(alert => alert.severity === 'info').length,
      resolved: alerts.filter(alert => alert.status === 'resolved').length,
      averageResponseTime: 15 // Mock data - in real app would calculate from database
    };
    setStats(newStats);
  }, [alerts]);
  
  const getSeverityConfig = (severity: string | undefined) => {
    if (!severity) {
      return {
        color: '#6C757D',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/50',
        textColor: 'text-gray-300',
        icon: AlertTriangle,
        badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      };
    }
    
    switch (severity) {
      case 'critical':
        return {
          color: '#DC3545',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-300',
          icon: AlertTriangle,
          badge: 'bg-red-500/20 text-red-300 border-red-500/30'
        };
      case 'warning':
        return {
          color: '#FFC107',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-300',
          icon: AlertCircle,
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        };
      case 'info':
        return {
          color: '#00E0A1',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/50',
          textColor: 'text-primary',
          icon: Bell,
          badge: 'bg-primary/20 text-primary border-primary/30'
        };
      default:
        return {
          color: '#6C757D',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-300',
          icon: Bell,
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        };
    }
  };
  
  const formatTimestamp = (timestamp: Date | string | number) => {
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now.getTime() - timestampDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestampDate.toLocaleDateString();
  };
  
  return (
    <div className="space-y-6">
      {/* Alert Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-orange-400">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Alert Center */}
      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Alert Center</span>
              {unresolvedCount > 0 && (
                <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                  {unresolvedCount} Active
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Implement filter */}}
                className="text-xs"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAll}
                className="text-xs"
              >
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({stats.critical})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <AlertList alerts={recentAlerts} onAlertAction={onAlertAction} />
            </TabsContent>
            
            <TabsContent value="active" className="mt-4">
              <AlertList 
                alerts={recentAlerts.filter(alert => alert.status === 'active')} 
                onAlertAction={onAlertAction} 
              />
            </TabsContent>
            
            <TabsContent value="critical" className="mt-4">
              <AlertList 
                alerts={recentAlerts.filter(alert => alert.severity === 'critical')} 
                onAlertAction={onAlertAction} 
              />
            </TabsContent>
            
            <TabsContent value="resolved" className="mt-4">
              <AlertList 
                alerts={recentAlerts.filter(alert => alert.status === 'resolved')} 
                onAlertAction={onAlertAction} 
              />
            </TabsContent>
          </Tabs>
          
          {recentAlerts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Showing {recentAlerts.length} of {alerts.length} alerts</span>
                  <span>•</span>
                  <span>Avg Response Time: {stats.averageResponseTime}min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Implement export */}}
                    className="text-xs"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewAll}
                    className="text-xs"
                  >
                    View All Alerts
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for rendering alert list
function AlertList({ alerts, onAlertAction }: { alerts: Alert[], onAlertAction: (alertId: string, action: string) => void }) {
  const getSeverityConfig = (severity: string | undefined) => {
    if (!severity) {
      return {
        color: '#6C757D',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/50',
        textColor: 'text-gray-300',
        icon: AlertTriangle,
        badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      };
    }
    
    switch (severity) {
      case 'critical':
        return {
          color: '#DC3545',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-300',
          icon: AlertTriangle,
          badge: 'bg-red-500/20 text-red-300 border-red-500/30'
        };
      case 'warning':
        return {
          color: '#FFC107',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-300',
          icon: AlertCircle,
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        };
      case 'info':
        return {
          color: '#00E0A1',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/50',
          textColor: 'text-primary',
          icon: Bell,
          badge: 'bg-primary/20 text-primary border-primary/30'
        };
      default:
        return {
          color: '#6C757D',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-300',
          icon: Bell,
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        };
    }
  };

  const formatTimestamp = (timestamp: Date | string | number) => {
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now.getTime() - timestampDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestampDate.toLocaleDateString();
  };

  return (
    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-border/60">
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No alerts in this category</p>
          <p className="text-xs">System operating normally</p>
        </div>
      ) : (
        alerts.map((alert) => {
          const config = getSeverityConfig(alert.severity);
          const Icon = config.icon;
          
          return (
            <div
              key={alert.id}
              className={cn(
                "p-5 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start space-x-4">
                <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.textColor)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-sm font-semibold truncate leading-none">{alert.title}</h4>
                    <Badge variant="outline" className={cn("text-xs px-2 py-1 leading-none", config.badge)}>
                      {alert.severity?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                    {alert.status === 'acknowledged' && (
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-2 py-1 leading-none">
                        ACKNOWLEDGED
                      </Badge>
                    )}
                    {alert.status === 'resolved' && (
                      <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-2 py-1 leading-none">
                        RESOLVED
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-90 mb-3 line-clamp-2 leading-relaxed">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs opacity-70">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{formatTimestamp(alert.timestamp)}</span>
                      {alert.location && (
                        <>
                          <span>•</span>
                          <span>{alert.location}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.status === 'active' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAlertAction(alert.id, 'acknowledge');
                            }}
                            className="h-8 px-3 text-xs"
                          >
                            Acknowledge
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAlertAction(alert.id, 'resolve');
                            }}
                            className="h-8 px-3 text-xs"
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAlertAction(alert.id, 'resolve');
                          }}
                          className="h-8 px-3 text-xs"
                        >
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAlertAction(alert.id, 'dismiss');
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
