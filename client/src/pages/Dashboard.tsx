import { DashboardLayout } from '@/components/DashboardLayout';
import { EnergyKPICard } from '@/components/EnergyKPICard';
import { EnergyChart } from '@/components/EnergyChart';
import { AlertBanner } from '@/components/AlertBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Battery, Zap, Home, Sun, Wind, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
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

  // Initialize system mutation
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/system/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to initialize system');
      return response.json();
    },
    onSuccess: () => {
      setIsInitialized(true);
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      toast({
        title: "System Initialized",
        description: "Energy management system is now active with sample data.",
      });
    },
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

  const handleAlertDismiss = (alertId: string) => {
    dismissAlertMutation.mutate(alertId);
  };

  const handleAlertAction = (actionType: string) => {
    console.log(`${actionType} action triggered`);
    toast({
      title: "Action Triggered",
      description: `${actionType} panel would open in a full system.`,
    });
  };

  // Show initialization screen if not initialized
  if (!isInitialized) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <span>Energy Management System</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Initialize the system to start monitoring energy data and AI-powered anomaly detection.
              </p>
              <Button 
                onClick={() => initializeMutation.mutate()}
                disabled={initializeMutation.isPending}
                className="w-full"
                data-testid="button-initialize-system"
              >
                {initializeMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Initialize System
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
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
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <span>Failed to load dashboard data. Please refresh the page.</span>
            </div>
          </CardContent>
        </Card>
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
          onAction={() => handleAlertAction('Investigation')}
        />
      ))}
    </div>
  ) : null;

  return (
    <DashboardLayout alerts={alertComponents}>
      <div className="space-y-6">
        {/* Real-time Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Energy Dashboard</h2>
            <p className="text-muted-foreground">
              Real-time monitoring and AI-powered anomaly detection
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Last Update</div>
              <div className="font-mono text-lg">{currentTime.toLocaleTimeString()}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateMutation.mutate('normal')}
              disabled={simulateMutation.isPending}
              data-testid="button-simulate-data"
            >
              {simulateMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Simulate Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateMutation.mutate('anomaly')}
              disabled={simulateMutation.isPending}
              data-testid="button-simulate-anomaly"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Test Anomaly
            </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              {aiInsights && 'insights' in aiInsights && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">AI Daily Insights</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {(aiInsights as any).insights}
                  </p>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => handleAlertAction('AI Insights')}
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
            <CardTitle>Daily Energy Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dailyTotals.consumption} kWh</div>
                <div className="text-sm text-muted-foreground">Total Consumption</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dailyTotals.generation} kWh</div>
                <div className="text-sm text-muted-foreground">Solar Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dailyTotals.co2Saved} kg</div>
                <div className="text-sm text-muted-foreground">CO₂ Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}