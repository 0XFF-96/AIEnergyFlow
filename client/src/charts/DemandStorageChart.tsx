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
    <div className="w-full bg-card border border-card-border rounded-2xl p-6">
      {title && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-semibold text-foreground">
              {title}
            </h3>
            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Demand patterns and storage optimization</p>
        </div>
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
              backgroundColor: 'hsl(var(--popover))', 
              border: '1px solid hsl(var(--popover-border))',
              borderRadius: '12px',
              color: 'hsl(var(--popover-foreground))',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'Storage Level') {
                return [`${value.toFixed(1)}%`, name];
              }
              return [`${value.toFixed(0)} MW`, name];
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
          <Legend 
            wrapperStyle={{ color: 'hsl(var(--muted-foreground))', paddingTop: '20px' }}
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
      <div className="mt-6 bg-gradient-to-r from-slate-800/30 to-slate-700/30 border border-slate-600/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm"></div>
              <span className="text-muted-foreground text-sm font-medium">Optimal (60%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm"></div>
              <span className="text-muted-foreground text-sm font-medium">Moderate (20-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-sm"></div>
              <span className="text-muted-foreground text-sm font-medium">Low (&lt;20%)</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Current Level</div>
            <div className="text-lg font-bold text-foreground">
              {data[data.length - 1]?.storage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}