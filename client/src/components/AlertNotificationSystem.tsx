import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Bell, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  timestamp: Date;
  requiresConfirmation?: boolean;
}

interface AlertNotificationSystemProps {
  alerts: Alert[];
  onAlertAction: (alertId: string, action: string) => void;
}

export function AlertNotificationSystem({ alerts, onAlertAction }: AlertNotificationSystemProps) {
  const [topBarAlert, setTopBarAlert] = useState<Alert | null>(null);
  const [modalAlert, setModalAlert] = useState<Alert | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [processedAlerts, setProcessedAlerts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  useEffect(() => {
    // Process new alerts based on severity - only process unprocessed alerts
    const newAlerts = alerts.filter(alert => !processedAlerts.has(alert.id));
    
    for (const alert of newAlerts) {
      // Mark as processed immediately to prevent duplicate processing
      setProcessedAlerts(prev => new Set([...Array.from(prev), alert.id]));
      
      switch (alert.severity) {
        case 'critical':
          // Critical alerts require modal confirmation
          if (!modalAlert) { // Only show if no modal is already open
            setModalAlert(alert);
          }
          break;
          
        case 'warning':
          // Warning alerts highlight dashboard
          if (!topBarAlert) { // Only show if no top bar is already showing
            setTopBarAlert(alert);
            // Auto-hide after 30 seconds
            setTimeout(() => setTopBarAlert(null), 30000);
          }
          break;
          
        case 'info':
          // Info alerts show as toast notifications
          toast({
            title: alert.title,
            description: alert.description,
            duration: 5000,
          });
          break;
      }
    }
    
    // Update unread count
    setUnreadCount(alerts.filter(alert => !alert.id.includes('read')).length);
  }, [alerts, toast, processedAlerts, modalAlert, topBarAlert]);

  // Clean up processed alerts periodically to prevent memory leaks
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setProcessedAlerts(prev => {
        const currentAlertIds = new Set(alerts.map(alert => alert.id));
        const newProcessed = new Set<string>();
        
        // Only keep processed alerts that still exist in current alerts
        for (const alertId of Array.from(prev)) {
          if (currentAlertIds.has(alertId)) {
            newProcessed.add(alertId);
          }
        }
        
        return newProcessed;
      });
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, [alerts]);
  
  const handleDismissTopBar = () => {
    if (topBarAlert) {
      onAlertAction(topBarAlert.id, 'dismiss');
      setTopBarAlert(null);
      // Remove from processed alerts to allow re-processing if needed
      setProcessedAlerts(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(topBarAlert.id);
        return newSet;
      });
    }
  };
  
  const handleConfirmModal = () => {
    if (modalAlert) {
      onAlertAction(modalAlert.id, 'acknowledge');
      setModalAlert(null);
      // Remove from processed alerts to allow re-processing if needed
      setProcessedAlerts(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(modalAlert.id);
        return newSet;
      });
    }
  };
  
  const handleDismissModal = () => {
    if (modalAlert) {
      onAlertAction(modalAlert.id, 'dismiss');
      setModalAlert(null);
      // Remove from processed alerts to allow re-processing if needed
      setProcessedAlerts(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(modalAlert.id);
        return newSet;
      });
    }
  };
  
  const getSeverityConfig = (severity: string | undefined) => {
    if (!severity) {
      return {
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500',
        textColor: 'text-gray-300',
        icon: AlertTriangle,
        pulseColor: ''
      };
    }
    
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
          textColor: 'text-red-300',
          icon: AlertTriangle,
          pulseColor: 'animate-pulse'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-300',
          icon: AlertTriangle,
          pulseColor: 'animate-pulse'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-300',
          icon: Bell,
          pulseColor: ''
        };
      default:
        return {
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-300',
          icon: Bell,
          pulseColor: ''
        };
    }
  };
  
  return (
    <>
      {/* Top Bar Alert (Medium Severity) */}
      {topBarAlert && (
        <div className="fixed top-0 left-0 right-0 z-40 p-4">
          <Card className={cn(
            "border-2 shadow-lg",
            getSeverityConfig(topBarAlert.severity).bgColor,
            getSeverityConfig(topBarAlert.severity).borderColor,
            getSeverityConfig(topBarAlert.severity).pulseColor
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={cn("h-5 w-5", getSeverityConfig(topBarAlert.severity).textColor)} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{topBarAlert.title}</h4>
                    <p className="text-sm opacity-90">{topBarAlert.description}</p>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    getSeverityConfig(topBarAlert.severity).textColor
                  )}>
                    {topBarAlert.severity?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAlertAction(topBarAlert.id, 'acknowledge')}
                    className="text-xs h-7"
                  >
                    Acknowledge
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismissTopBar}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Modal Alert (High/Critical Severity) */}
      <Dialog open={!!modalAlert} onOpenChange={() => setModalAlert(null)}>
        <DialogContent className="max-w-lg">
          {modalAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    getSeverityConfig(modalAlert.severity).bgColor
                  )}>
                    <AlertTriangle className={cn(
                      "h-5 w-5",
                      getSeverityConfig(modalAlert.severity).textColor,
                      getSeverityConfig(modalAlert.severity).pulseColor
                    )} />
                  </div>
                  <div>
                    <span>Critical Alert</span>
                    <Badge className={cn(
                      "ml-2 text-xs",
                      getSeverityConfig(modalAlert.severity).textColor
                    )}>
                      {modalAlert.severity?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{modalAlert.title}</h3>
                  <p className="text-muted-foreground">{modalAlert.description}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Type: {modalAlert.type}</span>
                  <span>Time: {modalAlert.timestamp.toLocaleTimeString()}</span>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Action Required:</strong> This is a critical alert that requires immediate attention. 
                    Please acknowledge that you have seen this alert and take appropriate action.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleDismissModal}
                    className="text-sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Dismiss
                  </Button>
                  <Button
                    onClick={handleConfirmModal}
                    className="text-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acknowledge & Investigate
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Alert Count Badge (for header/navigation) */}
      {unreadCount > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <div className="relative">
            <Bell className="h-6 w-6 text-muted-foreground" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          </div>
        </div>
      )}
    </>
  );
}
