import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

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
  return (
    <div className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-6" style={{ height }}>
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
          {title}
        </h3>
      )}

      <div style={{ height: '100%' }}>
        <ResponsiveBar
          data={data}
          keys={['amount']}
          indexBy="source"
          layout="vertical"
          margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
          padding={0.3}
          colors={(d) => d.data.color}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          label={(d) => `${d.value} ${unit}`}
          labelSkipWidth={10}
          labelSkipHeight={12}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Source',
            legendPosition: 'middle',
            legendOffset: 60,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: `Amount (${unit})`,
            legendPosition: 'middle',
            legendOffset: -50,
          }}
          tooltip={({ data }) => (
            <div className="bg-slate-800 text-white p-2 rounded shadow-lg text-sm">
              <strong>{data.source}</strong>: {data.amount} {unit}
              {data.capacity && (
                <div className="text-gray-300 text-xs">
                  Utilization: {((data.amount / data.capacity) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          )}
          enableGridY={true}
          enableGridX={false}
        />
      </div>
    </div>
  );
}
