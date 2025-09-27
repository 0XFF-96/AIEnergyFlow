import { DashboardLayout } from '../DashboardLayout';
import { EnergyKPICard } from '../EnergyKPICard';
import { EnergyChart } from '../EnergyChart';
import { AlertBanner } from '../AlertBanner';
import { ThemeProvider } from '../ThemeProvider';
import { Battery, Zap, Home, Sun } from 'lucide-react';

export default function DashboardLayoutExample() {
  // todo: remove mock functionality
  const mockChartData = [
    { time: '00:00', consumption: 145, generation: 0, storage: 78 },
    { time: '04:00', consumption: 142, generation: 0, storage: 72 },
    { time: '08:00', consumption: 178, generation: 45, storage: 68 },
    { time: '12:00', consumption: 159, generation: 95, storage: 78 },
    { time: '16:00', consumption: 152, generation: 67, storage: 79 },
    { time: '20:00', consumption: 172, generation: 0, storage: 71 },
  ];

  const alerts = (
    <div className="space-y-3">
      <AlertBanner
        type="anomaly"
        title="AI Anomaly Detected"
        description="Unusual consumption pattern detected in Zone 3. Anomaly score: 0.87"
        timestamp="8 minutes ago"
        onDismiss={() => console.log('Anomaly dismissed')}
        actionLabel="Investigate"
        onAction={() => console.log('Investigate anomaly')}
      />
    </div>
  );

  return (
    <ThemeProvider defaultTheme="dark">
      <DashboardLayout alerts={alerts}>
        <div className="space-y-6">
          {/* KPI Cards */}
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

          {/* Chart */}
          <EnergyChart
            title="24-Hour Energy Overview"
            data={mockChartData}
            height={400}
          />
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}