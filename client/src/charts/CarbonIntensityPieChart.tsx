import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Leaf, AlertTriangle } from 'lucide-react';

interface CarbonIntensityData {
  name: string;
  value: number;
  color: string;
  range: string;
  impact: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
}

interface CarbonIntensityPieChartProps {
  data: CarbonIntensityData[];
  title?: string;
  height?: number;
  totalEmissions?: number; // Total gCO2/kWh
  showImpactIndicator?: boolean;
}

export function CarbonIntensityPieChart({ 
  data, 
  title = "Carbon Intensity Distribution", 
  height = 400,
  totalEmissions = 0,
  showImpactIndicator = true
}: CarbonIntensityPieChartProps) {
  
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
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
          <p className="text-gray-300 text-sm">{`Range: ${data.range}`}</p>
        </div>
      );
    }
    return null;
  };

  const getImpactLevel = (emissions: number) => {
    if (emissions <= 50) return { level: 'Excellent', color: 'text-green-400', icon: '🌱' };
    if (emissions <= 150) return { level: 'Good', color: 'text-lime-400', icon: '🍃' };
    if (emissions <= 300) return { level: 'Moderate', color: 'text-yellow-400', icon: '⚠️' };
    if (emissions <= 500) return { level: 'Poor', color: 'text-orange-400', icon: '🔥' };
    return { level: 'Very Poor', color: 'text-red-400', icon: '💨' };
  };

  const impactInfo = getImpactLevel(totalEmissions);

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="space-y-2 mt-4">
        {payload.map((entry: any, index: number) => {
          const item = data.find(d => d.name === entry.value);
          return (
            <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground text-sm">{entry.value}</span>
              </div>
              <div className="text-right">
                <span className="text-foreground text-sm font-medium">
                  {item?.value.toFixed(1)}%
                </span>
                <p className="text-muted-foreground text-xs">{item?.range}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-card border border-card-border rounded-2xl p-6">
      {title && (
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
            <Leaf className="h-5 w-5 text-green-400" />
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">Environmental impact breakdown</p>
        </div>
      )}

      {/* Current Carbon Intensity Display */}
      {showImpactIndicator && (
        <div className="bg-muted rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Current Carbon Intensity</p>
              <p className="text-3xl font-bold text-foreground">{totalEmissions}</p>
              <p className="text-muted-foreground text-sm">gCO₂/kWh</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl ${impactInfo.color} font-bold`}>
                {impactInfo.icon}
              </div>
              <p className={`${impactInfo.color} font-semibold text-sm`}>
                {impactInfo.level}
              </p>
            </div>
          </div>
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
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Environmental Impact Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
          <Leaf className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-400">
            {data
              .filter(item => item.impact === 'very-low' || item.impact === 'low')
              .reduce((acc, item) => acc + item.value, 0)
              .toFixed(1)}%
          </p>
          <p className="text-green-300 text-sm">Low Carbon</p>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
          <AlertTriangle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-yellow-400">
            {data
              .filter(item => item.impact === 'moderate')
              .reduce((acc, item) => acc + item.value, 0)
              .toFixed(1)}%
          </p>
          <p className="text-yellow-300 text-sm">Moderate Carbon</p>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
          <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-red-400">
            {data
              .filter(item => item.impact === 'high' || item.impact === 'very-high')
              .reduce((acc, item) => acc + item.value, 0)
              .toFixed(1)}%
          </p>
          <p className="text-red-300 text-sm">High Carbon</p>
        </div>
      </div>

      {/* Timeline Indicator */}
      <div className="mt-4 text-center text-slate-400 text-xs">
        Last updated: {new Date().toLocaleTimeString()} • Next update in 30s
      </div>
    </div>
  );
}