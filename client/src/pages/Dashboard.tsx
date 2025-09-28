import { DashboardLayout } from '@/components/DashboardLayout';
import { EnergyKPICard } from '@/components/EnergyKPICard';
import { EnergyChart } from '@/components/EnergyChart';
import { AlertBanner } from '@/components/AlertBanner';
import { AlertDashboard } from '@/components/AlertDashboard';
import { AlertSystemIntegration } from '@/components/AlertSystemIntegration';
import { AlertConfig } from '@/components/AlertConfig';
import SystemInitialization, { UserRole, MicrogridLocation } from '@/components/SystemInitialization';
import { FloatingAIButton } from '@/components/FloatingAIButton';
import { RefreshRateSettings } from '@/components/RefreshRateSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Import new chart components
import { EnergyMixPieChart } from '@/charts/EnergyMixPieChart';
import { LineGenerationChart } from '@/charts/LineGenerationChart';
import { RealtimeAlertsComponent } from '@/charts/RealtimeAlertsComponent';
import { CarbonIntensityPieChart } from '@/charts/CarbonIntensityPieChart';
import { DemandStorageChart } from '@/charts/DemandStorageChart';
import { EnergyAmountBarChart } from '@/charts/EnergyAmountBarChart';

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
import { Battery, Zap, Home, Sun, Wind, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Bell, Activity, Settings, RotateCcw } from 'lucide-react';
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
  const [showAlertCenter, setShowAlertCenter] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [refreshRates, setRefreshRates] = useState({
    dashboard: 120000, // 2 minutes
    aiInsights: 300000, // 5 minutes
    charts: 120000, // 2 minutes
    alerts: 10000 // 10 seconds
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    refetchInterval: refreshRates.dashboard || false, // Use dynamic refresh rate
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
    refetchInterval: refreshRates.aiInsights || false, // Use dynamic refresh rate
  });

  // Alert processing removed - no more popup notifications

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

  // Unified color palette for consistent visual design
  const energyColors = {
    solar: '#f59e0b',      // Amber - warm, energetic
    wind: '#10b981',        // Emerald - natural, clean
    gas: '#ef4444',         // Red - warning, fossil fuel
    nuclear: '#3b82f6',     // Blue - stable, reliable
    hydro: '#06b6d4',       // Cyan - water, flow
    coal: '#6b7280',        // Gray - dirty, outdated
    oil: '#dc2626',         // Dark red - high carbon
    biomass: '#84cc16',     // Lime - organic, renewable
    geothermal: '#8b5cf6',  // Purple - earth, deep
    storage: '#6366f1'      // Indigo - technology, smart
  };

  const statusColors = {
    excellent: '#10b981',   // Green - excellent performance
    good: '#84cc16',        // Lime - good performance  
    moderate: '#f59e0b',    // Amber - moderate performance
    poor: '#f97316',        // Orange - poor performance
    critical: '#ef4444'     // Red - critical issues
  };

  const intensityColors = {
    veryLow: '#10b981',     // Green - very low carbon
    low: '#84cc16',         // Lime - low carbon
    moderate: '#f59e0b',    // Amber - moderate carbon
    high: '#f97316',        // Orange - high carbon
    veryHigh: '#ef4444'     // Red - very high carbon
  };

  // Generate mock data for new chart components
  const generateMockEnergyMixData = () => [
    { name: 'Solar', value: 45.2, color: energyColors.solar, intensity: 0 },
    { name: 'Wind', value: 28.7, color: energyColors.wind, intensity: 0 },
    { name: 'Gas', value: 15.3, color: energyColors.gas, intensity: 350 },
    { name: 'Nuclear', value: 8.1, color: energyColors.nuclear, intensity: 12 },
    { name: 'Hydro', value: 2.7, color: energyColors.hydro, intensity: 0 }
  ];

  const generateMockGenerationData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const baseGeneration = 50 + Math.sin(hour * Math.PI / 12) * 30;
      const solar = hour >= 6 && hour <= 18 ? baseGeneration * 0.6 : 0;
      const wind = baseGeneration * 0.3 + Math.random() * 20;
      const gas = Math.max(0, baseGeneration * 0.2 - solar - wind);
      
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        generation: Math.round(baseGeneration),
        solar: Math.round(solar),
        wind: Math.round(wind),
        gas: Math.round(gas),
        nuclear: 15
      };
    });
    return hours;
  };

  const generateMockCarbonIntensityData = () => [
    { name: 'Very Low (0-50)', value: 35.2, color: intensityColors.veryLow, range: '0-50 gCO₂/kWh', impact: 'very-low' },
    { name: 'Low (50-150)', value: 28.7, color: intensityColors.low, range: '50-150 gCO₂/kWh', impact: 'low' },
    { name: 'Moderate (150-300)', value: 20.1, color: intensityColors.moderate, range: '150-300 gCO₂/kWh', impact: 'moderate' },
    { name: 'High (300-500)', value: 12.3, color: intensityColors.high, range: '300-500 gCO₂/kWh', impact: 'high' },
    { name: 'Very High (500+)', value: 3.7, color: intensityColors.veryHigh, range: '500+ gCO₂/kWh', impact: 'very-high' }
  ];

  const generateMockDemandStorageData = () => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const demand = 80 + Math.sin(hour * Math.PI / 12) * 40 + Math.random() * 20;
      const storage = Math.max(10, 70 - hour * 2 + Math.random() * 10);
      const generation = hour >= 6 && hour <= 18 ? demand * 0.8 : demand * 0.2;
      
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        demand: Math.round(demand),
        storage: Math.round(storage),
        generation: Math.round(generation)
      };
    });
  };

  const generateMockEnergyAmountData = () => [
    { source: 'Solar Panels', amount: 125.4, color: energyColors.solar, capacity: 200 },
    { source: 'Wind Turbines', amount: 89.2, color: energyColors.wind, capacity: 150 },
    { source: 'Gas Generator', amount: 45.8, color: energyColors.gas, capacity: 100 },
    { source: 'Nuclear Plant', amount: 15.0, color: energyColors.nuclear, capacity: 20 },
    { source: 'Hydro Dam', amount: 8.5, color: energyColors.hydro, capacity: 15 }
  ];

  const mockEnergyMixData = generateMockEnergyMixData();
  const mockGenerationData = generateMockGenerationData();
  const mockCarbonIntensityData = generateMockCarbonIntensityData();
  const mockDemandStorageData = generateMockDemandStorageData();
  const mockEnergyAmountData = generateMockEnergyAmountData();

  const alertComponents = alerts.length > 0 ? (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          type={alert.type}
          title={alert.title}
          description={alert.description}
          timestamp={new Date(alert.timestamp).toLocaleString()}
          onDismiss={() => console.log('Alert dismissed:', alert.id)}
          actionLabel="Investigate"
          onAction={() => handleAlertAction(alert.id, 'investigate')}
        />
      ))}
    </div>
  ) : null;

  return (
    <>
      <DashboardLayout 
        alerts={alertComponents}
        alertCount={alerts.length}
        onAlertCenterClick={() => setShowAlertCenter(true)}
        onSystemClick={() => setShowSystemSettings(true)}
        userRole={userRole || undefined}
        microgridLocation={microgridLocation || undefined}
      >
      
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full h-12 grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center justify-center space-x-2 py-3">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Energy Overview</span>
          </TabsTrigger>
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

        {/* New Chart Components Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Mix Pie Chart */}
          <EnergyMixPieChart
            data={mockEnergyMixData}
            title="Current Energy Mix"
            height={400}
          />
          
          {/* Generation Line Chart */}
          <LineGenerationChart
            data={mockGenerationData}
            title="Generation Over Time"
            height={400}
          />
        </div>

        {/* Second Row - Carbon Intensity and Demand Storage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CarbonIntensityPieChart
            data={mockCarbonIntensityData}
            title="Carbon Intensity Distribution"
            totalEmissions={180}
            height={400}
          />
          
          <DemandStorageChart
            data={mockDemandStorageData}
            title="Demand vs Storage Balance"
            height={400}
          />
        </div>

        {/* Third Row - Energy Amount and Real-time Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnergyAmountBarChart
            data={mockEnergyAmountData}
            title="Energy Production by Source"
            height={400}
          />
          
          <RealtimeAlertsComponent
            alerts={[]}
            title="Real-time System Alerts"
            maxAlerts={5}
            onAlertAction={handleAlertAction}
          />
        </div>

        {/* System Status */}
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

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



        <TabsContent value="analytics" className="space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">Analytics & Reports</h2>
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">
              Deep insights into energy patterns and system performance
            </p>
          </div>
          
          {/* Analytics KPI Cards */}
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

          {/* Advanced Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Mix Analysis */}
            <EnergyMixPieChart
              data={mockEnergyMixData}
              title="Energy Mix Analysis"
              height={350}
            />
            
            {/* Carbon Intensity Analysis */}
            <CarbonIntensityPieChart
              data={mockCarbonIntensityData}
              title="Environmental Impact Analysis"
              totalEmissions={180}
              height={350}
            />
          </div>

          {/* Generation and Storage Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineGenerationChart
              data={mockGenerationData}
              title="Generation Pattern Analysis"
              height={350}
            />
            
            <DemandStorageChart
              data={mockDemandStorageData}
              title="Demand & Storage Analytics"
              height={350}
            />
          </div>

          {/* Production Analytics */}
          <div className="grid grid-cols-1 gap-6">
            <EnergyAmountBarChart
              data={mockEnergyAmountData}
              title="Energy Production Analytics"
              height={400}
            />
          </div>

          {/* Real-time Monitoring */}
          <div className="grid grid-cols-1 gap-6">
            <RealtimeAlertsComponent
              alerts={[]}
              title="System Monitoring & Alerts"
              maxAlerts={8}
              onAlertAction={handleAlertAction}
            />
          </div>
        </TabsContent>
      </Tabs>
      </DashboardLayout>

      {/* Alert Center Modal */}
      <Dialog open={showAlertCenter} onOpenChange={setShowAlertCenter}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-background/95 backdrop-blur">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold">Alert Center</span>
                {alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {alerts.length} Active Alerts
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Real-time Monitoring</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-background/50">
            <div className="max-w-none space-y-6">
              <RefreshRateSettings 
                onRefreshRateChange={setRefreshRates}
              />
              <AlertSystemIntegration
                alerts={[]}
                onAlertAction={handleAlertAction}
              />
            </div>
          </div>
          
          {/* Footer with quick actions */}
          <div className="p-4 border-t border-border/40 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Last updated: {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Refresh alerts
                    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
                  }}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlertCenter(false)}
                  className="flex items-center space-x-2"
                >
                  <span>Close</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* System Settings Modal */}
      <Dialog open={showSystemSettings} onOpenChange={setShowSystemSettings}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-background/95 backdrop-blur">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold">System Settings</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Configure system parameters and alert rules</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-background/50">
            <div className="max-w-none">
              {userRole === 'operator' ? (
                <AlertConfig onSave={handleAlertConfigSave} />
              ) : (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground mb-4">
                    System settings are only available to operators.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact your system administrator for configuration changes.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer with quick actions */}
          <div className="p-4 border-t border-border/40 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Settings saved automatically
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Reset to defaults
                    toast({
                      title: "Settings Reset",
                      description: "Settings have been reset to defaults.",
                    });
                  }}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSystemSettings(false)}
                  className="flex items-center space-x-2"
                >
                  <span>Close</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating AI Insights Button */}
      <FloatingAIButton 
        alerts={alerts}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        }}
      />
    </>
  );
}