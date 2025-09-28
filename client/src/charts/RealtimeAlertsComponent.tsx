import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, X, Clock, Zap } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'high' | 'medium' | 'low';
  source?: string;
  acknowledged?: boolean;
  autoResolve?: boolean;
}

interface RealtimeAlertsProps {
  alerts: Alert[];
  title?: string;
  maxAlerts?: number;
  onAlertAction?: (alertId: string, action: 'acknowledge' | 'dismiss' | 'resolve') => void;
  autoRefresh?: boolean;
}

export function RealtimeAlertsComponent({ 
  alerts = [], 
  title = "Real-time System Alerts", 
  maxAlerts = 5,
  onAlertAction,
  autoRefresh = true
}: RealtimeAlertsProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [autoRefresh]);

  useEffect(() => {
    // Sort alerts by severity and timestamp, then limit to maxAlerts
    const sortedAlerts = [...alerts]
      .sort((a, b) => {
        const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, maxAlerts);
    
    setVisibleAlerts(sortedAlerts);
  }, [alerts, maxAlerts]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const getAlertStyles = (type: Alert['type'], severity: Alert['severity']) => {
    const baseStyles = "border rounded-lg p-4 transition-all duration-300 hover:shadow-lg";
    
    switch (type) {
      case 'critical':
        return `${baseStyles} bg-red-500/10 border-red-500/30 hover:bg-red-500/15`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15`;
      case 'info':
        return `${baseStyles} bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15`;
      case 'success':
        return `${baseStyles} bg-green-500/10 border-green-500/30 hover:bg-green-500/15`;
      default:
        return `${baseStyles} bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/15`;
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">MED</span>;
      case 'low':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">LOW</span>;
      default:
        return null;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const diff = currentTime.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'dismiss' | 'resolve') => {
    if (onAlertAction) {
      onAlertAction(alertId, action);
    }
  };

  const getAlertStats = () => {
    const critical = alerts.filter(a => a.type === 'critical').length;
    const warning = alerts.filter(a => a.type === 'warning').length;
    const info = alerts.filter(a => a.type === 'info').length;
    const total = alerts.length;

    return { critical, warning, info, total };
  };

  const stats = getAlertStats();

  return (
    <div className="w-full bg-card border border-card-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            <Zap className="h-6 w-6 text-yellow-400" />
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          {autoRefresh && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
              <Clock className="h-3 w-3" />
              <span className="font-medium">Live</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Active Alerts</div>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-4 text-center hover:from-red-500/15 hover:to-red-600/15 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">Critical</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 text-center hover:from-yellow-500/15 hover:to-orange-500/15 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="text-2xl font-bold text-yellow-400">{stats.warning}</div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">Warning</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 text-center hover:from-blue-500/15 hover:to-cyan-500/15 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="text-2xl font-bold text-blue-400">{stats.info}</div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">Info</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 text-center hover:from-green-500/15 hover:to-emerald-500/15 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="text-2xl font-bold text-green-400">
              {alerts.filter(a => a.acknowledged).length}
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">Acked</div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No active alerts</p>
            <p className="text-muted-foreground/70 text-sm">All systems operating normally</p>
          </div>
        ) : (
          visibleAlerts.map((alert) => (
            <div key={alert.id} className={getAlertStyles(alert.type, alert.severity)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium text-sm truncate">
                        {alert.title}
                      </h4>
                      {getSeverityBadge(alert.severity)}
                      {alert.acknowledged && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                          ACK
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{getTimeAgo(alert.timestamp)}</span>
                      {alert.source && <span>Source: {alert.source}</span>}
                    </div>
                  </div>
                </div>
                
                {/* Alert Actions */}
                <div className="flex items-center gap-1 ml-3">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                      title="Acknowledge"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleAlertAction(alert.id, 'resolve')}
                    className="p-1.5 text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                    title="Resolve"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleAlertAction(alert.id, 'dismiss')}
                    className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {alerts.length > maxAlerts && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-center text-muted-foreground text-sm">
            Showing {maxAlerts} of {alerts.length} alerts
            <span className="ml-2 text-blue-400 cursor-pointer hover:underline">
              View all alerts →
            </span>
          </p>
        </div>
      )}

      <div className="mt-4 text-center text-muted-foreground/70 text-xs">
        Last updated: {currentTime.toLocaleTimeString()}
      </div>
    </div>
  );
}