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
  
  // Ensure data completeness - all slices should be visible
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const normalizedData = data.map(item => ({
    ...item,
    value: item.value,
    percentage: (item.value / totalValue * 100).toFixed(1)
  }));
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    // Show labels for all slices, but adjust positioning for small slices
    if (percent < 0.01) return null; // Only hide if less than 1%
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Adjust font size based on slice size
    const fontSize = percent < 0.05 ? "10" : percent < 0.1 ? "11" : "13";
    const fontWeight = percent < 0.05 ? "600" : "700";

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={fontWeight}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="2"
        paintOrder="stroke fill"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const impactIcons: Record<string, string> = {
        'very-low': '🌱',
        'low': '🍃', 
        'moderate': '⚠️',
        'high': '🔥',
        'very-high': '💨'
      };
      
      return (
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 border border-slate-600/50 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{impactIcons[data.impact] || '🌍'}</span>
            <p className="text-white font-bold text-lg">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-blue-300 font-semibold">{`Share: ${data.value.toFixed(1)}%`}</p>
            <p className="text-gray-300 text-sm">{`Range: ${data.range}`}</p>
            <div className="flex items-center gap-2 mt-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-xs text-gray-400 capitalize">{data.impact.replace('-', ' ')} Impact</span>
            </div>
          </div>
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
    const impactIcons: Record<string, string> = {
      'very-low': '🌱',
      'low': '🍃', 
      'moderate': '⚠️',
      'high': '🔥',
      'very-high': '💨'
    };
    
    return (
      <div className="space-y-3 mt-6">
        {payload.map((entry: any, index: number) => {
          const item = normalizedData.find(d => d.name === entry.value);
          return (
            <div key={index} className="flex items-center justify-between bg-gradient-to-r from-slate-800/30 to-slate-700/30 border border-slate-600/20 rounded-xl p-3 hover:from-slate-800/50 hover:to-slate-700/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-2xl">{impactIcons[item?.impact || ''] || '🌍'}</span>
                </div>
                <div>
                  <span className="text-foreground text-sm font-semibold">{entry.value}</span>
                  <p className="text-muted-foreground text-xs">{item?.range}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-foreground text-lg font-bold">
                  {item?.value.toFixed(1)}%
                </span>
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
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <Leaf className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold text-foreground">
              {title}
            </h3>
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Environmental impact breakdown</p>
        </div>
      )}

      {/* Current Carbon Intensity Display */}
      {showImpactIndicator && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
                <p className="text-muted-foreground text-sm font-medium">Current Carbon Intensity</p>
              </div>
              <p className="text-4xl font-bold text-foreground mb-1">{totalEmissions}</p>
              <p className="text-muted-foreground text-sm">gCO₂/kWh</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl ${impactInfo.color} font-bold mb-1`}>
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
            data={normalizedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={Math.min(height * 0.4, 160)}
            innerRadius={Math.min(height * 0.15, 60)}
            fill="#8884d8"
            dataKey="value"
            stroke="hsl(var(--card))"
            strokeWidth={2}
            paddingAngle={1}
            cornerRadius={4}
          >
            {normalizedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Environmental Impact Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 text-center hover:from-green-500/20 hover:to-emerald-500/15 transition-all duration-300 group">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl">🌱</span>
            <Leaf className="h-6 w-6 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400 mb-2">
            {normalizedData
              .filter(item => item.impact === 'very-low' || item.impact === 'low')
              .reduce((acc, item) => acc + item.value, 0)
              .toFixed(1)}%
          </p>
          <p className="text-green-300 text-sm font-semibold">Low Carbon</p>
          <p className="text-green-400/70 text-xs mt-1">Excellent Performance</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/15 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 text-center hover:from-yellow-500/20 hover:to-orange-500/15 transition-all duration-300 group">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl">⚠️</span>
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400 mb-2">
            {normalizedData
              .filter(item => item.impact === 'moderate')
              .reduce((acc, item) => acc + item.value, 0)
              .toFixed(1)}%
          </p>
          <p className="text-yellow-300 text-sm font-semibold">Moderate Carbon</p>
          <p className="text-yellow-400/70 text-xs mt-1">Needs Attention</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500/15 to-red-600/10 border border-red-500/30 rounded-xl p-6 text-center hover:from-red-500/20 hover:to-red-600/15 transition-all duration-300 group">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl">🔥</span>
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400 mb-2">
            {normalizedData
              .filter(item => item.impact === 'high' || item.impact === 'very-high')
              .reduce((acc, item) => acc + item.value, 0)
              .toFixed(1)}%
          </p>
          <p className="text-red-300 text-sm font-semibold">High Carbon</p>
          <p className="text-red-400/70 text-xs mt-1">Critical Action Required</p>
        </div>
      </div>

      {/* Data Completeness Indicator */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-blue-300 text-xs font-medium">
            Data Coverage: {totalValue.toFixed(1)}% • All segments visible
          </span>
        </div>
        
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-800/30 to-slate-700/30 border border-slate-600/20 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-muted-foreground text-xs font-medium">
            Last updated: {new Date().toLocaleTimeString()} • Next update in 30s
          </span>
        </div>
      </div>
    </div>
  );
}