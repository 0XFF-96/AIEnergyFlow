import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertHistoryProps {
  alerts: any[];
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
  onFilter: (filters: AlertFilters) => void;
}

interface AlertFilters {
  severity: string;
  type: string;
  status: string;
  dateRange: string;
  search: string;
}

interface AlertStats {
  total: number;
  active: number;
  resolved: number;
  critical: number;
  averageResponseTime: number;
  falsePositiveRate: number;
}

export function AlertHistory({ alerts, onExport, onFilter }: AlertHistoryProps) {
  const [filters, setFilters] = useState<AlertFilters>({
    severity: 'all',
    type: 'all',
    status: 'all',
    dateRange: '7d',
    search: ''
  });
  
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    active: 0,
    resolved: 0,
    critical: 0,
    averageResponseTime: 0,
    falsePositiveRate: 0
  });
  
  useEffect(() => {
    // Calculate statistics
    const total = alerts.length;
    const active = alerts.filter(a => a.status === 'active').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    const critical = alerts.filter(a => a.severity === 'critical').length;
    
    // Calculate average response time (mock data)
    const averageResponseTime = 15; // minutes
    
    // Calculate false positive rate (mock data)
    const falsePositiveRate = 5.2; // percentage
    
    setStats({
      total,
      active,
      resolved,
      critical,
      averageResponseTime,
      falsePositiveRate
    });
  }, [alerts]);
  
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filters.severity === 'all' || alert.severity === filters.severity;
    const matchesType = filters.type === 'all' || alert.type === filters.type;
    const matchesStatus = filters.status === 'all' || alert.status === filters.status;
    const matchesSearch = filters.search === '' || 
      alert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      alert.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSeverity && matchesType && matchesStatus && matchesSearch;
  });
  
  const handleFilterChange = (key: keyof AlertFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };
  
  const handleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(alert => alert.id));
    }
  };
  
  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };
  
  const getSeverityConfig = (severity: string | undefined) => {
    if (!severity) {
      return {
        color: '#6C757D',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-300',
        badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      };
    }
    
    switch (severity) {
      case 'critical':
        return {
          color: '#DC3545',
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-300',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30'
        };
      case 'warning':
        return {
          color: '#FFC107',
          bgColor: 'bg-yellow-500/10',
          textColor: 'text-yellow-300',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        };
      case 'info':
        return {
          color: '#00E0A1',
          bgColor: 'bg-primary/10',
          textColor: 'text-primary',
          badge: 'bg-primary/20 text-primary border-primary/30'
        };
      default:
        return {
          color: '#6C757D',
          bgColor: 'bg-gray-500/10',
          textColor: 'text-gray-300',
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        };
    }
  };
  
  const formatTimestamp = (timestamp: Date | string | number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-red-300">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-red-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-300">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{stats.averageResponseTime}m</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Alert History</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('csv')}
                className="text-xs"
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
                className="text-xs"
              >
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="consumption">Consumption</SelectItem>
                <SelectItem value="generation">Generation</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="device_fault">Device Fault</SelectItem>
                <SelectItem value="anomaly">Anomaly</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Alert List */}
          <div className="space-y-2">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts found matching your filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const config = getSeverityConfig(alert.severity);
                
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                      config.bgColor,
                      selectedAlerts.includes(alert.id) && "ring-2 ring-primary"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.id)}
                        onChange={() => handleSelectAlert(alert.id)}
                        className="rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold truncate">{alert.title}</h4>
                          <Badge variant="outline" className={config.badge}>
                            {alert.severity?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {alert.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(alert.timestamp)}</span>
                          </span>
                          {alert.location && (
                            <span>{alert.location}</span>
                          )}
                          {alert.deviceId && (
                            <span className="font-mono">{alert.deviceId}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Pagination */}
          {filteredAlerts.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
              <div className="text-sm text-muted-foreground">
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedAlerts.length === filteredAlerts.length ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedAlerts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport('json')}
                    className="text-xs"
                  >
                    Export Selected ({selectedAlerts.length})
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
