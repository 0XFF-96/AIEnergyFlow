import { DashboardLayout } from '@/components/DashboardLayout';
import { EnergyKPICard } from '@/components/EnergyKPICard';
import { EnergyChart } from '@/components/EnergyChart';
import { AlertBanner } from '@/components/AlertBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Battery, Zap, Home, Sun, Wind, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  // todo: remove mock functionality
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlerts, setActiveAlerts] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // todo: remove mock functionality
  const mockChartData = [
    { time: '00:00', consumption: 145, generation: 0, storage: 78 },
    { time: '02:00', consumption: 138, generation: 0, storage: 75 },
    { time: '04:00', consumption: 142, generation: 0, storage: 72 },
    { time: '06:00', consumption: 156, generation: 15, storage: 70 },
    { time: '08:00', consumption: 178, generation: 45, storage: 68 },
    { time: '10:00', consumption: 165, generation: 78, storage: 72 },
    { time: '12:00', consumption: 159, generation: 95, storage: 78 },
    { time: '14:00', consumption: 147, generation: 89, storage: 82 },
    { time: '16:00', consumption: 152, generation: 67, storage: 79 },
    { time: '18:00', consumption: 168, generation: 23, storage: 75 },
    { time: '20:00', consumption: 172, generation: 0, storage: 71 },
    { time: '22:00', consumption: 158, generation: 0, storage: 68 },
  ];

  const handleAlertDismiss = (alertId: string) => {
    console.log(`Alert ${alertId} dismissed`);
    if (alertId === 'anomaly-1') {
      setActiveAlerts(false);
    }
  };

  const alerts = activeAlerts ? (
    <div className="space-y-3">
      <AlertBanner
        type="anomaly"
        title="AI Anomaly Detected"
        description="Unusual consumption pattern detected in Zone 3. Anomaly score: 0.87 - Potential equipment malfunction or unauthorized usage."
        timestamp="8 minutes ago"
        onDismiss={() => handleAlertDismiss('anomaly-1')}
        actionLabel="Investigate"
        onAction={() => console.log('Opening anomaly investigation panel')}
      />
      <AlertBanner
        type="warning"
        title="Battery Storage Low"
        description="Battery storage level at 15%. Consider reducing non-essential loads or switching to grid power."
        timestamp="12 minutes ago"
        onDismiss={() => handleAlertDismiss('battery-1')}
        actionLabel="Optimize"
        onAction={() => console.log('Opening battery optimization settings')}
      />
    </div>
  ) : null;

  return (
    <DashboardLayout alerts={alerts}>
      <div className="space-y-6">
        {/* Real-time Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Energy Dashboard</h2>
            <p className="text-muted-foreground">
              Real-time monitoring and AI-powered anomaly detection
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Last Update</div>
            <div className="font-mono text-lg">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnergyKPICard
            title="Total Consumption"
            value="147.2"
            unit="kW"
            trend={{ value: 12, direction: "up" }}
            status="normal"
            icon={<Home className="h-4 w-4" />}
          />
          <EnergyKPICard
            title="Solar Generation"
            value="89.5"
            unit="kW"
            trend={{ value: 8, direction: "up" }}
            status="normal"
            icon={<Sun className="h-4 w-4" />}
          />
          <EnergyKPICard
            title="Battery Storage"
            value="78.3"
            unit="%"
            trend={{ value: 5, direction: "down" }}
            status="warning"
            icon={<Battery className="h-4 w-4" />}
          />
          <EnergyKPICard
            title="Grid Export"
            value="23.1"
            unit="kW"
            trend={{ value: 15, direction: "up" }}
            status="normal"
            icon={<Zap className="h-4 w-4" />}
          />
        </div>

        {/* Main Chart */}
        <EnergyChart
          title="24-Hour Energy Overview"
          data={mockChartData}
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
                <Badge className="bg-primary/20 text-primary border-primary/30">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Battery System</span>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Charging</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Grid Connection</span>
                <Badge className="bg-primary/20 text-primary border-primary/30">Stable</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Load Balancer</span>
                <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Monitoring */}
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <span>AI Monitoring</span>
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
                <span className="text-sm">Confidence Score</span>
                <span className="font-mono text-sm">94.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Anomalies Detected Today</span>
                <span className="font-mono text-sm text-yellow-300">3</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => console.log('Opening AI insights panel')}
                data-testid="button-ai-insights"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View AI Insights
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
                <div className="text-2xl font-bold text-primary">142.8 kWh</div>
                <div className="text-sm text-muted-foreground">Total Consumption</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98.4 kWh</div>
                <div className="text-sm text-muted-foreground">Solar Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">31.2 kg</div>
                <div className="text-sm text-muted-foreground">CO₂ Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}