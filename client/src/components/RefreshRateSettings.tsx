import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, Zap, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshRateSettingsProps {
  onRefreshRateChange?: (rates: RefreshRates) => void;
  className?: string;
}

interface RefreshRates {
  dashboard: number; // milliseconds
  aiInsights: number; // milliseconds
  charts: number; // milliseconds
  alerts: number; // milliseconds
}

const REFRESH_RATE_OPTIONS = [
  { label: 'Real-time (10s)', value: 10000, description: 'High frequency updates' },
  { label: 'Fast (30s)', value: 30000, description: 'Frequent updates' },
  { label: 'Normal (2min)', value: 120000, description: 'Balanced performance' },
  { label: 'Slow (5min)', value: 300000, description: 'Reduced server load' },
  { label: 'Minimal (10min)', value: 600000, description: 'Minimal updates' },
  { label: 'Manual Only', value: 0, description: 'No automatic refresh' }
];

export function RefreshRateSettings({ onRefreshRateChange, className }: RefreshRateSettingsProps) {
  const [refreshRates, setRefreshRates] = useState<RefreshRates>({
    dashboard: 120000, // 2 minutes
    aiInsights: 300000, // 5 minutes
    charts: 120000, // 2 minutes
    alerts: 10000 // 10 seconds
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('refreshRates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRefreshRates(parsed);
      } catch (error) {
        console.error('Failed to parse saved refresh rates:', error);
      }
    }
  }, []);

  const handleRateChange = (type: keyof RefreshRates, value: number) => {
    const newRates = { ...refreshRates, [type]: value };
    setRefreshRates(newRates);
    localStorage.setItem('refreshRates', JSON.stringify(newRates));
    onRefreshRateChange?.(newRates);
  };

  const getRateLabel = (value: number) => {
    const option = REFRESH_RATE_OPTIONS.find(opt => opt.value === value);
    return option?.label || 'Custom';
  };

  const getRateDescription = (value: number) => {
    const option = REFRESH_RATE_OPTIONS.find(opt => opt.value === value);
    return option?.description || 'Custom refresh rate';
  };

  const getPerformanceImpact = (value: number) => {
    if (value === 0) return { level: 'minimal', color: 'bg-green-500/20 text-green-400', text: 'Minimal' };
    if (value <= 30000) return { level: 'high', color: 'bg-red-500/20 text-red-400', text: 'High' };
    if (value <= 120000) return { level: 'medium', color: 'bg-yellow-500/20 text-yellow-400', text: 'Medium' };
    return { level: 'low', color: 'bg-green-500/20 text-green-400', text: 'Low' };
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <span>Refresh Rate Settings</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <Clock className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Dashboard Refresh Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Dashboard Data</span>
              </div>
              <Badge className={getPerformanceImpact(refreshRates.dashboard).color}>
                {getPerformanceImpact(refreshRates.dashboard).text}
              </Badge>
            </div>
            <Select
              value={refreshRates.dashboard.toString()}
              onValueChange={(value) => handleRateChange('dashboard', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_RATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current: {getRateLabel(refreshRates.dashboard)} - {getRateDescription(refreshRates.dashboard)}
            </p>
          </div>

          {/* AI Insights Refresh Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium">AI Insights</span>
              </div>
              <Badge className={getPerformanceImpact(refreshRates.aiInsights).color}>
                {getPerformanceImpact(refreshRates.aiInsights).text}
              </Badge>
            </div>
            <Select
              value={refreshRates.aiInsights.toString()}
              onValueChange={(value) => handleRateChange('aiInsights', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_RATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current: {getRateLabel(refreshRates.aiInsights)} - {getRateDescription(refreshRates.aiInsights)}
            </p>
          </div>

          {/* Charts Refresh Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">Charts & Analytics</span>
              </div>
              <Badge className={getPerformanceImpact(refreshRates.charts).color}>
                {getPerformanceImpact(refreshRates.charts).text}
              </Badge>
            </div>
            <Select
              value={refreshRates.charts.toString()}
              onValueChange={(value) => handleRateChange('charts', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_RATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current: {getRateLabel(refreshRates.charts)} - {getRateDescription(refreshRates.charts)}
            </p>
          </div>

          {/* Alerts Refresh Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium">Real-time Alerts</span>
              </div>
              <Badge className={getPerformanceImpact(refreshRates.alerts).color}>
                {getPerformanceImpact(refreshRates.alerts).text}
              </Badge>
            </div>
            <Select
              value={refreshRates.alerts.toString()}
              onValueChange={(value) => handleRateChange('alerts', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_RATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current: {getRateLabel(refreshRates.alerts)} - {getRateDescription(refreshRates.alerts)}
            </p>
          </div>

          {/* Performance Summary */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Performance Impact</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Server Load:</span>
                <span className={getPerformanceImpact(Math.min(...Object.values(refreshRates))).color}>
                  {getPerformanceImpact(Math.min(...Object.values(refreshRates))).text}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data Freshness:</span>
                <span className={getPerformanceImpact(Math.max(...Object.values(refreshRates))).color}>
                  {getPerformanceImpact(Math.max(...Object.values(refreshRates))).text}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
