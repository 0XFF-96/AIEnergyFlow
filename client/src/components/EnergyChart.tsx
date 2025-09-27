import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";

interface ChartDataPoint {
  time: string;
  consumption: number;
  generation: number;
  storage: number;
}

interface EnergyChartProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
}

export function EnergyChart({ title, data, height = 300 }: EnergyChartProps) {
  const [hoveredData, setHoveredData] = useState<ChartDataPoint | null>(null);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-md p-3 shadow-lg">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toFixed(1)} kW`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`chart-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {hoveredData && (
          <div className="text-sm text-muted-foreground">
            Consumption: {hoveredData.consumption.toFixed(1)} kW | 
            Generation: {hoveredData.generation.toFixed(1)} kW | 
            Storage: {hoveredData.storage.toFixed(1)} kW
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
            />
            <Line 
              type="monotone" 
              dataKey="consumption" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'hsl(var(--chart-3))', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="generation" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="storage" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
            <span className="text-sm text-muted-foreground">Consumption</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
            <span className="text-sm text-muted-foreground">Generation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span className="text-sm text-muted-foreground">Storage</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}