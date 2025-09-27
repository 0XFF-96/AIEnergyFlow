import { useState } from 'react';
import { AlertDashboard } from './AlertDashboard';
import { AlertDetails } from './AlertDetails';
import { AlertHistory } from './AlertHistory';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Download, RefreshCw, Plus, BarChart3, Filter } from 'lucide-react';

interface AlertSystemIntegrationProps {
  alerts: any[];
  onAlertAction: (alertId: string, action: string, notes?: string) => void;
}

export function AlertSystemIntegration({ alerts, onAlertAction }: AlertSystemIntegrationProps) {
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const handleAlertAction = (alertId: string, action: string, notes?: string) => {
    onAlertAction(alertId, action, notes);
    
    // Close dialogs after action
    if (action === 'resolve' || action === 'dismiss') {
      setSelectedAlert(null);
    }
  };
  
  const handleViewAll = () => {
    setShowHistory(true);
  };
  
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    // Implement export functionality
    console.log(`Exporting alerts as ${format}`);
  };
  
  const handleFilter = (filters: any) => {
    // Implement filtering
    console.log('Applying filters:', filters);
  };
  
  const activeAlerts = alerts.filter(alert => alert.status === 'active' || !alert.status);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  
  return (
    <div className="space-y-6">
      {/* Quick Actions Panel */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Alert Management Actions</span>
            <div className="flex items-center space-x-2">
              {activeAlerts.length > 0 && (
                <Badge variant="destructive">
                  {activeAlerts.length} Active
                </Badge>
              )}
              {criticalAlerts.length > 0 && (
                <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                  {criticalAlerts.length} Critical
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAll}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View History</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Simulate manual alert creation
                const mockAlert = {
                  id: `manual-${Date.now()}`,
                  title: 'Manual Test Alert',
                  description: 'This is a manually created test alert',
                  type: 'system_health',
                  severity: 'warning',
                  status: 'active',
                  timestamp: new Date(),
                  source: 'manual'
                };
                console.log('Creating manual alert:', mockAlert);
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Alert</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Refresh alerts
                console.log('Refreshing alerts...');
              }}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
          
          {/* Bulk Actions for Active Alerts */}
          {activeAlerts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Bulk Actions ({activeAlerts.length} active alerts)
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Acknowledge all active alerts
                      activeAlerts.forEach(alert => {
                        onAlertAction(alert.id, 'acknowledge', 'Bulk acknowledgment');
                      });
                    }}
                    className="text-xs"
                  >
                    Acknowledge All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Resolve all acknowledged alerts
                      const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged');
                      acknowledgedAlerts.forEach(alert => {
                        onAlertAction(alert.id, 'resolve', 'Bulk resolution');
                      });
                    }}
                    className="text-xs"
                  >
                    Resolve Acknowledged
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Dashboard Card - Shows recent alerts with enhanced features */}
      <AlertDashboard
        alerts={alerts}
        onAlertAction={handleAlertAction}
        onViewAll={handleViewAll}
      />

      {/* System Status and Recommendations */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>System Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalAlerts.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm font-medium text-red-300">
                  ⚠️ Immediate attention required
                </p>
                <p className="text-xs text-red-200 mt-1">
                  {criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''} need immediate investigation
                </p>
              </div>
            )}
            
            {activeAlerts.length > 5 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm font-medium text-yellow-300">
                  📊 Consider alert optimization
                </p>
                <p className="text-xs text-yellow-200 mt-1">
                  High alert volume detected. Review alert thresholds and rules.
                </p>
              </div>
            )}
            
            {alerts.length === 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm font-medium text-green-300">
                  ✅ System operating normally
                </p>
                <p className="text-xs text-green-200 mt-1">
                  No active alerts. All systems are functioning within normal parameters.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Alert Details Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedAlert && (
            <AlertDetails
              alert={selectedAlert}
              onAction={(action, notes) => handleAlertAction(selectedAlert.id, action, notes)}
              onClose={() => setSelectedAlert(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Alert History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <AlertHistory
            alerts={alerts}
            onExport={handleExport}
            onFilter={handleFilter}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
