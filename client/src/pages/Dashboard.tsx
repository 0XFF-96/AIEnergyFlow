import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Wrench, 
  Zap, 
  Home, 
  Sun, 
  Wind, 
  Factory, 
  AlertTriangle,
  TrendingUp,
  Battery,
  Leaf,
  Activity,
  RefreshCw
} from 'lucide-react';

// Import our custom chart components
import { LineGenerationChart } from '../components/charts/LineGenerationChart';
import { DemandStorageChart } from '../components/charts/DemandStorageChart';
import { EnergyMixPieChart } from '../components/charts/EnergyMixPieChart';
import { EnergyAmountBarChart } from '../components/charts/EnergyAmountBarChart';
import { CarbonIntensityPieChart } from '../components/charts/CarbonIntensityPieChart';
import { RealtimeAlertsComponent } from '../components/charts/RealtimeAlertsComponent';

// Mock data generators
const generateRealtimeData = () => {
  const now = new Date();
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Simulate realistic patterns
    const solarMultiplier = hour >= 6 && hour <= 18 ? Math.sin((hour - 6) * Math.PI / 12) : 0;
    const demandMultiplier = hour >= 7 && hour <= 22 ? 1.2 : 0.8;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      generation: Math.round(2500 + Math.sin(i * 0.3) * 800 + Math.random() * 300),
      demand: Math.round(2800 * demandMultiplier + Math.random() * 200),
      storage: Math.round(60 + Math.sin(i * 0.2) * 20 + Math.random() * 10),
      solar: Math.round(800 * solarMultiplier + Math.random() * 100),
      wind: Math.round(900 + Math.random() * 400),
      gas: Math.round(600 + Math.random() * 300),
      nuclear: Math.round(400 + Math.random() * 100),
      coal: Math.round(Math.max(0, 200 + Math.random() * 150))
    });
  }
  return data;
};

const energyMixData = [
  { name: "Gas", value: 38.5, color: "#ef4444", intensity: 490 },
  { name: "Wind", value: 28.2, color: "#22c55e", intensity: 0 },
  { name: "Solar", value: 15.8, color: "#facc15", intensity: 0 },
  { name: "Nuclear", value: 12.1, color: "#3b82f6", intensity: 12 },
  { name: "Coal", value: 3.8, color: "#64748b", intensity: 820 },
  { name: "Hydro", value: 1.6, color: "#06b6d4", intensity: 24 }
];

const carbonIntensityData = [
  { 
    name: "Gas", 
    value: 45.6, 
    color: "#22c55e", 
    range: "0-50 gCO₂/kWh",
    impact: 'very-low' as const
  },
  { 
    name: "Wind", 
    value: 15.8, 
    color: "#84cc16", 
    range: "51-150 gCO₂/kWh",
    impact: 'low' as const
  },
  { 
    name: "Solar", 
    value: 12.1, 
    color: "#facc15", 
    range: "151-300 gCO₂/kWh",
    impact: 'moderate' as const
  },
  { 
    name: "Coal", 
    value: 20.7, 
    color: "#f97316", 
    range: "301-500 gCO₂/kWh",
    impact: 'high' as const
  },
  { 
    name: "Nuclear", 
    value: 5.8, 
    color: "#ef4444", 
    range: "500+ gCO₂/kWh",
    impact: 'very-high' as const
  }
];

const generateAlerts = () => [
  { 
    id: '1', 
    type: 'warning' as const, 
    title: 'High Demand Detected',
    message: 'Unusual demand spike detected in Northern Grid - monitoring situation', 
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    severity: 'medium' as const,
    source: 'Grid Monitor',
    acknowledged: false
  },
  { 
    id: '2', 
    type: 'info' as const, 
    title: 'Solar Peak Generation',
    message: 'Solar generation peaked at 2.1 GW - excellent conditions', 
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: 'low' as const,
    source: 'Solar System',
    acknowledged: true
  },
  { 
    id: '3', 
    type: 'critical' as const, 
    title: 'Grid Frequency Deviation',
    message: 'Grid frequency deviation detected - automatic systems engaged', 
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    severity: 'high' as const,
    source: 'Frequency Monitor',
    acknowledged: false
  },
  { 
    id: '4', 
    type: 'warning' as const, 
    title: 'Battery Storage Low',
    message: 'Battery storage level below 25% - consider load balancing', 
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    severity: 'medium' as const,
    source: 'Storage System',
    acknowledged: false
  }
];

export default function CompleteEnergyDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData());
  const [currentView, setCurrentView] = useState('operator');
  const [alerts, setAlerts] = useState(generateAlerts());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setRealtimeData(generateRealtimeData());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // Calculate current metrics
  const currentData = realtimeData[realtimeData.length - 1] || {};
  const currentGeneration = currentData.generation || 0;
  const currentDemand = currentData.demand || 0;
  const currentStorage = currentData.storage || 0;
  const carbonIntensity = Math.round(
    energyMixData.reduce((acc, item) => acc + (item.value / 100) * item.intensity, 0)
  );

  const energyAmountData = energyMixData.map(item => ({
    source: item.name,
    amount: Math.round((item.value / 100) * currentGeneration) || 0, // 添加默认值防止NaN
    color: item.color
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRealtimeData(generateRealtimeData());
    setIsRefreshing(false);
  };

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'dismiss' | 'resolve') => {
    setAlerts(prevAlerts => {
      if (action === 'dismiss' || action === 'resolve') {
        return prevAlerts.filter(alert => alert.id !== alertId);
      } else if (action === 'acknowledge') {
        return prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        );
      }
      return prevAlerts;
    });
  };

  const OperatorView = () => (
    <div className="space-y-6">
      {/* Operator Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Wrench className="h-8 w-8 text-blue-400" />
              Operator Control Center
            </h1>
            <p className="text-slate-300 mt-2">Real-time grid monitoring and control interface</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <div className="text-right">
              <div className="text-sm text-slate-400">System Time</div>
              <div className="text-xl font-mono">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Generation</p>
                <p className="text-3xl font-bold text-blue-400">{currentGeneration.toFixed(0)}</p>
                <p className="text-sm text-slate-400">MW</p>
              </div>
              <Zap className="h-12 w-12 text-blue-400/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Current Demand</p>
                <p className="text-3xl font-bold text-orange-400">{currentDemand.toFixed(0)}</p>
                <p className="text-sm text-slate-400">MW</p>
              </div>
              <Home className="h-12 w-12 text-orange-400/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Storage Level</p>
                <p className="text-3xl font-bold text-green-400">{currentStorage.toFixed(1)}</p>
                <p className="text-sm text-slate-400">%</p>
              </div>
              <Battery className="h-12 w-12 text-green-400/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Carbon Intensity</p>
                <p className="text-3xl font-bold text-purple-400">{carbonIntensity}</p>
                <p className="text-sm text-slate-400">gCO₂/kWh</p>
              </div>
              <Leaf className="h-12 w-12 text-purple-400/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LineGenerationChart
          data={realtimeData}
          title="Generation Over Time (24h)"
          height={350}
        />
        
        <DemandStorageChart
          data={realtimeData}
          title="Demand vs Storage Balance"
          height={350}
        />
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EnergyMixPieChart
          data={energyMixData}
          title="Current Energy Mix"
          height={400}
        />
        
        <EnergyAmountBarChart
          data={energyAmountData}
          title="Generation by Source"
          height={600}
          layout="horizontal"
        />
      </div>

      {/* Real-time Alerts */}
      <RealtimeAlertsComponent
        alerts={alerts}
        title="Real-time System Alerts"
        maxAlerts={5}
        onAlertAction={handleAlertAction}
        autoRefresh={true}
      />
    </div>
  );

  const CommunityView = () => (
    <div className="space-y-6">
      {/* Community Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white border border-green-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8" />
              Community Energy Dashboard
            </h1>
            <p className="text-green-100 mt-2">Track our collective progress towards sustainable energy</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-green-400/30 text-green-100 hover:bg-green-500/20"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <div className="text-right">
              <div className="text-sm text-green-200">Live Data</div>
              <div className="text-xl font-mono">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/30">
          <CardContent className="p-6 text-center">
            <Leaf className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <p className="text-sm text-slate-400 mb-2">Clean Energy Share</p>
            <p className="text-4xl font-bold text-green-400 mb-1">
              {(energyMixData.filter(item => ['Wind', 'Solar', 'Hydro', 'Nuclear'].includes(item.name))
                .reduce((acc, item) => acc + item.value, 0)).toFixed(1)}%
            </p>
            <p className="text-sm text-green-300">+2.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-blue-500/30">
          <CardContent className="p-6 text-center">
            <Factory className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <p className="text-sm text-slate-400 mb-2">Carbon Intensity</p>
            <p className="text-4xl font-bold text-blue-400 mb-1">{carbonIntensity}</p>
            <p className="text-sm text-blue-300">gCO₂ per kWh</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-600/10 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <Sun className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <p className="text-sm text-slate-400 mb-2">Renewable Generation</p>
            <p className="text-4xl font-bold text-purple-400 mb-1">
              {Math.round(currentGeneration * 0.456)}
            </p>
            <p className="text-sm text-purple-300">MW right now</p>
          </CardContent>
        </Card>
      </div>

      {/* Community Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EnergyMixPieChart
          data={energyMixData}
          title="Current Energy Mix"
          height={450}
          showLabels={true}
          showLegend={true}
        />
        
        <CarbonIntensityPieChart
          data={carbonIntensityData}
          title="Carbon Intensity Distribution"
          height={450}
          totalEmissions={carbonIntensity}
          showImpactIndicator={true}
        />
      </div>

      {/* Renewable Energy Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <Wind className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Wind Power</p>
            <p className="text-xl font-bold text-emerald-400">{energyMixData[1].value}%</p>
            <p className="text-xs text-emerald-300">
              {Math.round((energyMixData[1].value / 100) * currentGeneration)} MW
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Sun className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Solar Power</p>
            <p className="text-xl font-bold text-yellow-400">{energyMixData[2].value}%</p>
            <p className="text-xs text-yellow-300">
              {Math.round((energyMixData[2].value / 100) * currentGeneration)} MW
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Nuclear</p>
            <p className="text-xl font-bold text-blue-400">{energyMixData[3].value}%</p>
            <p className="text-xs text-blue-300">
              {Math.round((energyMixData[3].value / 100) * currentGeneration)} MW
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <Battery className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Hydro</p>
            <p className="text-xl font-bold text-cyan-400">{energyMixData[5].value}%</p>
            <p className="text-xs text-cyan-300">
              {Math.round((energyMixData[5].value / 100) * currentGeneration)} MW
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Summary */}
      <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl">
            Today's Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-green-500/10 rounded-lg p-4">
              <Leaf className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-400">2.4 tons</p>
              <p className="text-sm text-slate-300">CO₂ emissions saved</p>
              <p className="text-xs text-green-400 mt-1">vs fossil fuel baseline</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-4">
              <Sun className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-yellow-400">1,200</p>
              <p className="text-sm text-slate-300">homes powered by renewables</p>
              <p className="text-xs text-yellow-400 mt-1">equivalent households</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4">
              <Wind className="h-12 w-12 text-blue-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-blue-400">
                {((currentGeneration - currentDemand) / currentGeneration * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-slate-300">grid efficiency today</p>
              <p className="text-xs text-blue-400 mt-1">
                {currentGeneration > currentDemand ? 'surplus generation' : 'balanced load'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Goals Progress */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-center">
            Community Sustainability Goals 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Renewable Energy Target</span>
                <span className="text-green-400">57.7% / 60%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full" 
                  style={{ width: '96%' }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Carbon Reduction Target</span>
                <span className="text-blue-400">220g / 200g CO₂/kWh</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full" 
                  style={{ width: '80%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Energy Efficiency Goal</span>
                <span className="text-purple-400">94% / 95%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-purple-400 h-2 rounded-full" 
                  style={{ width: '98.9%' }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* View Switcher */}
      <div className="mb-6 flex justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-600/30">
          <Button
            variant={currentView === 'operator' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('operator')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl"
          >
            <Wrench className="h-4 w-4" />
            Operator View
          </Button>
          <Button
            variant={currentView === 'community' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('community')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl"
          >
            <Users className="h-4 w-4" />
            Community View
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {currentView === 'operator' ? <OperatorView /> : <CommunityView />}
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-600/30 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-green-400" />
          <span className="text-slate-300">
            System Status: <span className="text-green-400">Online</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            Last Update: {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}