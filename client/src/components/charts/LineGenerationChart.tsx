import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GenerationChartProps {
  data: Array<{
    time: string;
    generation: number;
    solar?: number;
    wind?: number;
    gas?: number;
    nuclear?: number;
  }>;
  title?: string;
  height?: number;
}

export function LineGenerationChart({ data, title = "Generation Over Time", height = 300 }: GenerationChartProps) {
  return (
    <div className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}MW`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(0)} MW`, 
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
            labelStyle={{ color: '#d1d5db' }}
          />
          <Legend 
            wrapperStyle={{ color: '#d1d5db', paddingTop: '20px' }}
          />
          <Line 
            type="monotone" 
            dataKey="generation" 
            stroke="#60a5fa" 
            strokeWidth={3}
            name="Total Generation"
            dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1f2937', strokeWidth: 2 }}
          />
          {data[0]?.solar !== undefined && (
            <Line 
              type="monotone" 
              dataKey="solar" 
              stroke="#facc15" 
              strokeWidth={2}
              name="Solar"
              dot={{ fill: '#facc15', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#facc15', stroke: '#1f2937', strokeWidth: 2 }}
            />
          )}
          {data[0]?.wind !== undefined && (
            <Line 
              type="monotone" 
              dataKey="wind" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Wind"
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#22c55e', stroke: '#1f2937', strokeWidth: 2 }}
            />
          )}
          {data[0]?.gas !== undefined && (
            <Line 
              type="monotone" 
              dataKey="gas" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Gas"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#ef4444', stroke: '#1f2937', strokeWidth: 2 }}
            />
          )}
          {data[0]?.nuclear !== undefined && (
            <Line 
              type="monotone" 
              dataKey="nuclear" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Nuclear"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#3b82f6', stroke: '#1f2937', strokeWidth: 2 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}