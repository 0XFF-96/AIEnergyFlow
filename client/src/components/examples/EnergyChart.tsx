import { EnergyChart } from '../EnergyChart';
import { ThemeProvider } from '../ThemeProvider';

export default function EnergyChartExample() {
  // todo: remove mock functionality
  const mockData = [
    { time: '00:00', consumption: 145, generation: 0, storage: 78 },
    { time: '02:00', consumption: 138, generation: 0, storage: 75 },
    { time: '04:00', consumption: 142, generation: 0, storage: 72 },
    { time: '06:00', consumption: 156, generation: 15, storage: 70 },
    { time: '08:00', consumption: 178, generation: 45, storage: 68 },
    { time: '10:00', consumption: 165, generation: 78, storage: 72 },
    { time: '12:00', consumption: 159, generation: 95, storage: 78 },
    { time: '14:00', consumption: 147, generation: 89, storage: 82 },
    { time: '16:00', consumption: 152, generation: 67, storage: 79 },
    { time: '18:00', consumption: 168, generation: 23, storage: 75 },
    { time: '20:00', consumption: 172, generation: 0, storage: 71 },
    { time: '22:00', consumption: 158, generation: 0, storage: 68 },
  ];

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-4">
        <EnergyChart
          title="24-Hour Energy Overview"
          data={mockData}
          height={400}
        />
      </div>
    </ThemeProvider>
  );
}