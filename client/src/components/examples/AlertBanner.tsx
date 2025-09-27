import { AlertBanner } from '../AlertBanner';
import { ThemeProvider } from '../ThemeProvider';

export default function AlertBannerExample() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-4 space-y-4">
        {/* todo: remove mock functionality */}
        <AlertBanner
          type="critical"
          title="System Alert"
          description="Battery storage level critically low. Immediate attention required."
          timestamp="2 minutes ago"
          onDismiss={() => console.log('Critical alert dismissed')}
          actionLabel="View Details"
          onAction={() => console.log('View critical details')}
        />
        <AlertBanner
          type="warning"
          title="Performance Warning"
          description="Solar panel efficiency dropped by 15% in the last hour. Check panel status."
          timestamp="5 minutes ago"
          onDismiss={() => console.log('Warning dismissed')}
        />
        <AlertBanner
          type="anomaly"
          title="AI Anomaly Detected"
          description="Unusual consumption pattern detected in Zone 3. Anomaly score: 0.87"
          timestamp="8 minutes ago"
          onDismiss={() => console.log('Anomaly dismissed')}
          actionLabel="Investigate"
          onAction={() => console.log('Investigate anomaly')}
        />
        <AlertBanner
          type="success"
          title="System Optimization"
          description="Energy efficiency improved by 12% through automated load balancing."
          timestamp="1 hour ago"
          onDismiss={() => console.log('Success dismissed')}
        />
      </div>
    </ThemeProvider>
  );
}