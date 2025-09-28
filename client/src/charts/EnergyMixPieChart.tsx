import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface EnergyMixData {
  name: string;
  value: number;
  color: string;
  intensity?: number; // CO2 intensity in gCO2/kWh
}

interface EnergyMixPieChartProps {
  data: EnergyMixData[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

export function EnergyMixPieChart({ 
  data, 
  title = "Current Energy Mix", 
  height = 400,
  showLegend = true,
  showLabels = true
}: EnergyMixPieChartProps) {
  
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (!showLabels || percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-popover-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-blue-300">{`Share: ${data.value.toFixed(1)}%`}</p>
          {data.intensity !== undefined && (
            <p className="text-gray-300 text-sm">{`CO₂: ${data.intensity} g/kWh`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground text-sm">
              {entry.value} ({data.find(d => d.name === entry.value)?.value.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-card border border-card-border rounded-2xl p-6">
      {title && (
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">Real-time energy generation mix</p>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={Math.min(height * 0.35, 140)}
            fill="#8884d8"
            dataKey="value"
            stroke="#1f2937"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-2xl font-bold text-green-400">
            {data
              .filter(item => ['Wind', 'Solar', 'Hydro', 'Nuclear'].includes(item.name))
              .reduce((acc, item) => acc + item.value, 0)
              .toFixed(1)}%
          </p>
          <p className="text-muted-foreground text-sm">Clean Energy</p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-2xl font-bold text-orange-400">
            {data
              .filter(item => ['Gas', 'Coal', 'Oil'].includes(item.name))
              .reduce((acc, item) => acc + item.value, 0)
              .toFixed(1)}%
          </p>
          <p className="text-muted-foreground text-sm">Fossil Fuels</p>
        </div>
      </div>
    </div>
  );
}