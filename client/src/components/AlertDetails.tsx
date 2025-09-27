import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Cpu, 
  Battery, 
  Sun, 
  Zap,
  CheckCircle,
  X,
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertDetailsProps {
  alert: {
    id: string;
    title: string;
    description: string;
    severity?: 'info' | 'warning' | 'critical';
    type: string;
    timestamp: Date | string | number;
    status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
    source: string;
    deviceId?: string;
    location?: string;
    metadata?: Record<string, any>;
  };
  onAction: (action: string, notes?: string) => void;
  onClose: () => void;
}

interface TimelineEvent {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  description: string;
  type: 'system' | 'user' | 'ai';
}

export function AlertDetails({ alert, onAction, onClose }: AlertDetailsProps) {
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  
  // Mock timeline events - in real app, this would come from API
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      timestamp: new Date(new Date(alert.timestamp).getTime() - 300000), // 5 minutes before
      action: 'detected',
      user: 'AI System',
      description: 'Anomaly pattern detected in energy consumption data',
      type: 'ai'
    },
    {
      id: '2',
      timestamp: new Date(new Date(alert.timestamp).getTime() - 180000), // 3 minutes before
      action: 'analyzed',
      user: 'AI System',
      description: 'Confidence score: 0.87, Pattern type: consumption spike',
      type: 'ai'
    },
    {
      id: '3',
      timestamp: new Date(alert.timestamp),
      action: 'created',
      user: 'System',
      description: 'Alert created and notifications sent',
      type: 'system'
    }
  ];
  
  const getSeverityConfig = (severity: string | undefined) => {
    if (!severity) {
      return {
        color: '#6C757D',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/50',
        textColor: 'text-gray-300',
        icon: AlertTriangle,
        badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      };
    }
    
    switch (severity) {
      case 'critical':
        return {
          color: '#DC3545',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-300',
          icon: AlertTriangle,
          badge: 'bg-red-500/20 text-red-300 border-red-500/30'
        };
      case 'warning':
        return {
          color: '#FFC107',
          bgColor: '#FFC107',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-300',
          icon: AlertTriangle,
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        };
      case 'info':
        return {
          color: '#00E0A1',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/50',
          textColor: 'text-primary',
          icon: AlertTriangle,
          badge: 'bg-primary/20 text-primary border-primary/30'
        };
      default:
        return {
          color: '#6C757D',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-300',
          icon: AlertTriangle,
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        };
    }
  };
  
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'consumption':
      case 'grid':
        return Zap;
      case 'generation':
      case 'solar':
        return Sun;
      case 'storage':
      case 'battery':
        return Battery;
      default:
        return Cpu;
    }
  };
  
  const formatTimestamp = (timestamp: Date | string | number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const config = getSeverityConfig(alert.severity);
  const DeviceIcon = getDeviceIcon(alert.type);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded-lg", config.bgColor)}>
                <AlertTriangle className={cn("h-5 w-5", config.textColor)} />
              </div>
              <div>
                <CardTitle className="text-lg">{alert.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={config.badge}>
                    {alert.severity?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {alert.type.toUpperCase()}
                  </Badge>
                  {alert.status === 'acknowledged' && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                      ACKNOWLEDGED
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Alert Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Alert Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={config.badge}>
                    {alert.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <span className="text-sm font-medium">{alert.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Timestamp</span>
                  <span className="text-sm font-medium">{formatTimestamp(alert.timestamp)}</span>
                </div>
                {alert.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.location}</span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <DeviceIcon className="h-4 w-4" />
                  <span>Device Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alert.deviceId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Device ID</span>
                    <span className="text-sm font-mono">{alert.deviceId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Component</span>
                  <span className="text-sm font-medium">{alert.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Severity</span>
                  <span className="text-sm font-medium" style={{ color: config.color }}>
                    {alert.severity?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                {alert.metadata && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <span className="text-sm font-medium">
                      {alert.metadata.confidence ? `${(alert.metadata.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {alert.description}
              </p>
            </CardContent>
          </Card>
          
          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Event Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        event.type === 'ai' ? 'bg-purple-500' :
                        event.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                      )} />
                      {index < timelineEvents.length - 1 && (
                        <div className="w-px h-8 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{event.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(event.timestamp)}</span>
                        <span>•</span>
                        <span>{event.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {alert.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction('acknowledge')}
                    className="text-xs"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                )}
                {alert.status === 'acknowledged' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction('resolve')}
                    className="text-xs"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Resolved
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-xs"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Add Notes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction('dismiss')}
                  className="text-xs"
                >
                  <X className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              </div>
              
              {showNotes && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add notes about this alert..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotes(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onAction('add_notes', notes);
                        setShowNotes(false);
                        setNotes('');
                      }}
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
