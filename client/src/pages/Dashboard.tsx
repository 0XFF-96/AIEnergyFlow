import { DashboardLayout } from '@/components/DashboardLayout';
import { EnergyKPICard } from '@/components/EnergyKPICard';
import { EnergyChart } from '@/components/EnergyChart';
import { AlertBanner } from '@/components/AlertBanner';
import { AlertDashboard } from '@/components/AlertDashboard';
import { AlertSystemIntegration } from '@/components/AlertSystemIntegration';
import { AlertNotificationSystem } from '@/components/AlertNotificationSystem';
import { AlertConfig } from '@/components/AlertConfig';
import SystemInitialization, { UserRole, MicrogridLocation } from '@/components/SystemInitialization';

// Import microgrid locations for display
const microgridLocations = [
  { value: 'north-perth', label: 'Microgrid North (Perth)', region: 'Northern Region' },
  { value: 'south-bunbury', label: 'Microgrid South (Bunbury)', region: 'Southern Region' },
  { value: 'east-kalgoorlie', label: 'Microgrid East (Kalgoorlie)', region: 'Eastern Region' },
  { value: 'west-geraldton', label: 'Microgrid West (Geraldton)', region: 'Western Region' },
];
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Battery, Zap, Home, Sun, Wind, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Bell, Activity, Settings } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  current: any;
  alerts: any[];
  anomalies: any[];
  dailyTotals: {
    consumption: number;
    generation: number;
    co2Saved: number;
  };
  chartData: any[];
  systemStatus: {
    solarPanels: string;
    battery: string;
    gridConnection: string;
    aiMonitoring: string;
  };
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [microgridLocation, setMicrogridLocation] = useState<MicrogridLocation | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isInitialized,
  });

  // Handle role and location selection
  const handleSystemInitialize = async (role: UserRole, location: MicrogridLocation) => {
    setUserRole(role);
    setMicrogridLocation(location);
    
    // Initialize system with user preferences
    const response = await fetch('/api/system/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userRole: role,
        microgridLocation: location,
      }),
    });
    
    if (!response.ok) throw new Error('Failed to initialize system');
    
    const result = await response.json();
    setIsInitialized(true);
    setShowRoleSelection(false);
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    
    toast({
      title: "System Initialized",
      description: `Welcome ${role === 'community' ? 'Community Member' : 'System Operator'}! ${location} microgrid is now active.`,
    });
    
    return result;
  };

  // Initialize system mutation
  const initializeMutation = useMutation({
    mutationFn: ({ role, location }: { role: UserRole; location: MicrogridLocation }) => 
      handleSystemInitialize(role, location),
    onError: (error) => {
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize the energy management system.",
        variant: "destructive",
      });
    },
  });

  // Simulate new data mutation
  const simulateMutation = useMutation({
    mutationFn: async (type: 'normal' | 'anomaly') => {
      const response = await fetch('/api/energy/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, anomalyType: 'consumption_spike' }),
      });
      if (!response.ok) throw new Error('Failed to simulate data');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      if (data.anomalyDetected) {
        toast({
          title: "Anomaly Detected",
          description: `AI detected an anomaly with score ${data.anomalyScore.toFixed(2)}`,
          variant: "destructive",
        });
      }
    },
  });

  // Dismiss alert mutation
  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to dismiss alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    },
  });

  // AI insights query
  const { data: aiInsights } = useQuery({
    queryKey: ['/api/ai/insights'],
    enabled: isInitialized,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Memoize processed alerts to prevent unnecessary re-renders
  const processedAlerts = useMemo(() => {
    const alerts = (dashboardData as DashboardData)?.alerts || [];
    return alerts.map((alert: any) => ({
      ...alert,
      severity: alert.type === 'critical' ? 'critical' : alert.type === 'warning' ? 'warning' : 'info',
      timestamp: new Date(alert.timestamp)
    }));
  }, [(dashboardData as DashboardData)?.alerts]);

  const handleAlertDismiss = (alertId: string) => {
    dismissAlertMutation.mutate(alertId);
  };

  const handleAlertAction = (alertId: string, action: string, notes?: string) => {
    console.log(`Alert ${alertId}: ${action} action triggered`, { notes });
    
    switch (action) {
      case 'acknowledge':
        toast({
          title: "Alert Acknowledged",
          description: `Alert ${alertId} has been acknowledged.`,
        });
        break;
      case 'resolve':
        toast({
          title: "Alert Resolved",
          description: `Alert ${alertId} has been marked as resolved.`,
        });
        break;
      case 'dismiss':
        dismissAlertMutation.mutate(alertId);
        break;
      case 'add_notes':
        toast({
          title: "Notes Added",
          description: `Notes added to alert ${alertId}.`,
        });
        break;
      default:
        toast({
          title: "Action Triggered",
          description: `${action} action triggered for alert ${alertId}.`,
        });
    }
    
    // Refresh alerts after action
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
  };

  const handleAlertConfigSave = (config: any) => {
    console.log('Saving alert configuration:', config);
    
    // In a real implementation, this would save to the backend
    localStorage.setItem('alertConfig', JSON.stringify(config));
    
    toast({
      title: "Configuration Saved",
      description: "Alert configuration has been saved successfully.",
    });
  };

  // Show role selection screen if not initialized
  if (!isInitialized || showRoleSelection) {
    return (
      <SystemInitialization
        onInitialize={(role, location) => initializeMutation.mutate({ role, location })}
        isInitializing={initializeMutation.isPending}
      />
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading energy data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="px-4">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-red-300">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-center sm:text-left">Failed to load dashboard data. Please refresh the page.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const data: DashboardData = dashboardData as DashboardData;
  const current = data?.current;
  const alerts = data?.alerts || [];
  const chartData = data?.chartData || [];
  const dailyTotals = data?.dailyTotals || { consumption: 0, generation: 0, co2Saved: 0 };
  const systemStatus = data?.systemStatus || {};

  const alertComponents = alerts.length > 0 ? (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          type={alert.type}
          title={alert.title}
          description={alert.description}
          timestamp={new Date(alert.timestamp).toLocaleString()}
          onDismiss={() => handleAlertDismiss(alert.id)}
          actionLabel="Investigate"
          onAction={() => handleAlertAction(alert.id, 'investigate')}
        />
      ))}
    </div>
  ) : null;

  return (
    <DashboardLayout alerts={alertComponents}>
      <AlertNotificationSystem 
        alerts={processedAlerts}
        onAlertAction={handleAlertDismiss}
      />
      
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className={`grid w-full h-12 ${userRole === 'community' ? 'grid-cols-3' : 'grid-cols-4'}`}>
          <TabsTrigger value="overview" className="flex items-center justify-center space-x-2 py-3">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Energy Overview</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center justify-center space-x-2 py-3 relative">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Alert Center</span>
            {alerts.length > 0 && (
              <Badge variant="outline" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          {userRole === 'operator' && (
            <TabsTrigger value="config" className="flex items-center justify-center space-x-2 py-3">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Alert Config</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics" className="flex items-center justify-center space-x-2 py-3">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Real-time Status Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">Energy Dashboard</h2>
              <p className="text-muted-foreground mt-2 text-sm lg:text-base">
                Real-time monitoring and AI-powered anomaly detection
              </p>
              {(userRole || microgridLocation) && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {userRole && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      {userRole === 'community' ? 'Community Member' : 'System Operator'}
                    </Badge>
                  )}
                  {microgridLocation && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      {microgridLocations.find(l => l.value === microgridLocation)?.label || 'Microgrid'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:items-end">
              <div className="text-center sm:text-right">
                <div className="text-xs text-muted-foreground font-medium">Last Update</div>
                <div className="font-mono text-base lg:text-lg mt-1">{currentTime.toLocaleTimeString()}</div>
              </div>
              {userRole === 'operator' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateMutation.mutate('normal')}
                    disabled={simulateMutation.isPending}
                    data-testid="button-simulate-data"
                    className="w-full sm:w-auto min-w-[120px]"
                  >
                    {simulateMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">Simulate Data</span>
                    <span className="sm:hidden">Simulate</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateMutation.mutate('anomaly')}
                    disabled={simulateMutation.isPending}
                    data-testid="button-simulate-anomaly"
                    className="w-full sm:w-auto min-w-[120px]"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Test Anomaly</span>
                    <span className="sm:hidden">Test</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnergyKPICard
            title="Total Consumption"
            value={current?.consumption?.toFixed(1) || '0.0'}
            unit="kW"
            trend={{ value: 12, direction: "up" }}
            status={current?.consumption > 200 ? "warning" : "normal"}
            icon={<Home className="h-4 w-4" />}
          />
          <EnergyKPICard
            title="Solar Generation"
            value={current?.generation?.toFixed(1) || '0.0'}
            unit="kW"
            trend={{ value: 8, direction: "up" }}
            status={current?.solarEfficiency < 75 ? "warning" : "normal"}
            icon={<Sun className="h-4 w-4" />}
          />
          <EnergyKPICard
            title="Battery Storage"
            value={current?.storage?.toFixed(1) || '0.0'}
            unit="%"
            trend={{ value: 5, direction: current?.storage > 50 ? "up" : "down" }}
            status={current?.storage < 20 ? "critical" : current?.storage < 40 ? "warning" : "normal"}
            icon={<Battery className="h-4 w-4" />}
          />
          <EnergyKPICard
            title="Grid Export"
            value={current?.gridExport?.toFixed(1) || '0.0'}
            unit="kW"
            trend={{ value: 15, direction: "up" }}
            status="normal"
            icon={<Zap className="h-4 w-4" />}
          />
        </div>

        {/* Main Chart */}
        <EnergyChart
          title="24-Hour Energy Overview"
          data={chartData}
          height={400}
        />

        {/* Bottom Grid - System Status and AI Monitoring */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* System Status */}
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Solar Panels</span>
                <Badge className={systemStatus.solarPanels === 'online' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}>
                  {systemStatus.solarPanels === 'online' ? 'Online' : 'Degraded'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Battery System</span>
                <Badge className={systemStatus.battery === 'normal' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                  {systemStatus.battery === 'normal' ? 'Normal' : 'Low'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Grid Connection</span>
                <Badge className="bg-primary/20 text-primary border-primary/30">Stable</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Monitoring</span>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Monitoring */}
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Anomaly Detection</span>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pattern Analysis</span>
                <Badge className="bg-primary/20 text-primary border-primary/30">Learning</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Alerts</span>
                <span className="font-mono text-sm text-yellow-300">{alerts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">System Health</span>
                <span className="font-mono text-sm text-primary">94.7%</span>
              </div>
              {aiInsights && typeof aiInsights === 'object' && aiInsights !== null && 'insights' in aiInsights ? (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">AI Daily Insights</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {(aiInsights as any).insights}
                  </p>
                </div>
              ) : null}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => handleAlertAction('ai-insights', 'view')}
                data-testid="button-ai-insights"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Detailed Insights
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Energy Efficiency Report */}
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="text-center lg:text-left">Daily Energy Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">{dailyTotals.consumption} kWh</div>
                <div className="text-sm text-muted-foreground">Total Consumption</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">{dailyTotals.generation} kWh</div>
                <div className="text-sm text-muted-foreground">Solar Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">{dailyTotals.co2Saved} kg</div>
                <div className="text-sm text-muted-foreground">CO₂ Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">Alert Management Center</h2>
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">
              Comprehensive alert monitoring, management, and analytics
            </p>
          </div>
          
          <AlertSystemIntegration
            alerts={alerts}
            onAlertAction={handleAlertAction}
          />
        </TabsContent>

        {userRole === 'operator' && (
          <TabsContent value="config" className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">Alert Configuration</h2>
              <p className="text-muted-foreground mt-2 text-sm lg:text-base">
                Configure threshold rules, AI detection, and notification settings
              </p>
            </div>
            
            <AlertConfig onSave={handleAlertConfigSave} />
          </TabsContent>
        )}

        <TabsContent value="analytics" className="space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">Analytics & Reports</h2>
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">
              Deep insights into energy patterns and system performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Energy Efficiency Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">94.7%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Alert Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">15 min</div>
                <p className="text-xs text-muted-foreground">-5 min from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">99.8%</div>
                <p className="text-xs text-muted-foreground">Excellent performance</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced analytics and reporting features will be available here, including:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Energy consumption patterns and forecasting</li>
                <li>Predictive maintenance recommendations</li>
                <li>Cost optimization analysis</li>
                <li>Carbon footprint tracking</li>
                <li>Custom report generation</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}