import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EnergyAmountData {
  source: string;
  amount: number;
  color: string;
  capacity?: number;
}

interface EnergyAmountBarChartProps {
  data: EnergyAmountData[];
  title?: string;
  height?: number;
  unit?: string;
}

export function EnergyAmountBarChart({
  data,
  title = 'Energy Production by Source',
  height = 400,
  unit = 'MW',
}: EnergyAmountBarChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-popover-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.source}</p>
          <p className="text-blue-300">{`Amount: ${data.amount} ${unit}`}</p>
          {data.capacity && (
            <p className="text-gray-300 text-sm">
              Utilization: {((data.amount / data.capacity) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-card border border-card-border rounded-2xl p-6">
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="source" 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} ${unit}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="amount" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            stroke="#1f2937"
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
