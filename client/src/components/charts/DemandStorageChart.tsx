import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DemandStorageChartProps {
  data: Array<{
    time: string;
    demand: number;
    storage: number;
    generation?: number;
  }>;
  title?: string;
  height?: number;
}

export function DemandStorageChart({ data, title = "Demand vs Storage Balance", height = 300 }: DemandStorageChartProps) {
  return (
    <div className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-orange-400 rounded-full"></div>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}MW`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'Storage Level') {
                return [`${value.toFixed(1)}%`, name];
              }
              return [`${value.toFixed(0)} MW`, name];
            }}
            labelStyle={{ color: '#d1d5db' }}
          />
          <Legend 
            wrapperStyle={{ color: '#d1d5db', paddingTop: '20px' }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="demand"
            stroke="#f97316"
            fill="url(#demandGradient)"
            strokeWidth={2}
            name="Demand"
          />
          {data[0]?.generation !== undefined && (
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="generation"
              stroke="#60a5fa"
              fill="none"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Generation"
            />
          )}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="storage"
            stroke="#22c55e"
            strokeWidth={3}
            name="Storage Level"
            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#22c55e', stroke: '#1f2937', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Storage Level Indicator */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-slate-300">Storage: Optimal (60%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-slate-300">Storage: Moderate (20-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-slate-300">Storage: Low (&lt;20%)</span>
          </div>
        </div>
        <div className="text-slate-400">
          Current: {data[data.length - 1]?.storage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}