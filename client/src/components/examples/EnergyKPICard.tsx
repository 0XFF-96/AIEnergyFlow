import { EnergyKPICard } from '../EnergyKPICard';
import { Battery, Zap, Home, Sun } from 'lucide-react';
import { ThemeProvider } from '../ThemeProvider';

export default function EnergyKPICardExample() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* todo: remove mock functionality */}
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
    </ThemeProvider>
  );
}