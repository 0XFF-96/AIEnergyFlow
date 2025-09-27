import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Battery, Zap, Gauge, Mail, MessageSquare, Bell, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThresholdRule {
  id: string;
  name: string;
  metric: string;
  operator: '>' | '<' | '>=' | '<=';
  value: number;
  unit: string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
}

interface NotificationSettings {
  dashboard: {
    enabled: boolean;
    highlightCards: boolean;
    showBadges: boolean;
  };
  email: {
    enabled: boolean;
    recipients: string[];
    severityFilter: string[];
  };
  sms: {
    enabled: boolean;
    phoneNumbers: string[];
    severityFilter: string[];
  };
  priorityRules: {
    critical: string[];
    warning: string[];
    info: string[];
  };
}


interface AlertConfigProps {
  onSave: (config: any) => void;
}

export function AlertConfig({ onSave }: AlertConfigProps) {
  const { toast } = useToast();
  
  // Threshold Rules State
  const [thresholdRules, setThresholdRules] = useState<ThresholdRule[]>([
    {
      id: 'battery-soc',
      name: 'Battery SOC Low',
      metric: 'battery_soc',
      operator: '<',
      value: 20,
      unit: '%',
      severity: 'critical',
      enabled: true
    },
    {
      id: 'voltage-high',
      name: 'Voltage High',
      metric: 'voltage',
      operator: '>',
      value: 240,
      unit: 'V',
      severity: 'warning',
      enabled: true
    },
    {
      id: 'load-high',
      name: 'Load High',
      metric: 'load',
      operator: '>',
      value: 5,
      unit: 'kW',
      severity: 'warning',
      enabled: true
    }
  ]);


  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    dashboard: {
      enabled: true,
      highlightCards: true,
      showBadges: true
    },
    email: {
      enabled: false,
      recipients: [],
      severityFilter: ['critical', 'warning']
    },
    sms: {
      enabled: false,
      phoneNumbers: [],
      severityFilter: ['critical']
    },
    priorityRules: {
      critical: ['sms', 'email', 'dashboard'],
      warning: ['email', 'dashboard'],
      info: ['dashboard']
    }
  });

  const [newEmailRecipient, setNewEmailRecipient] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const updateThresholdRule = (ruleId: string, updates: Partial<ThresholdRule>) => {
    setThresholdRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  };

  const addEmailRecipient = () => {
    if (newEmailRecipient && newEmailRecipient.includes('@')) {
      setNotificationSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          recipients: [...prev.email.recipients, newEmailRecipient]
        }
      }));
      setNewEmailRecipient('');
    } else {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
    }
  };

  const removeEmailRecipient = (email: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        recipients: prev.email.recipients.filter(r => r !== email)
      }
    }));
  };

  const addPhoneNumber = () => {
    if (newPhoneNumber && newPhoneNumber.length >= 10) {
      setNotificationSettings(prev => ({
        ...prev,
        sms: {
          ...prev.sms,
          phoneNumbers: [...prev.sms.phoneNumbers, newPhoneNumber]
        }
      }));
      setNewPhoneNumber('');
    } else {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
    }
  };

  const removePhoneNumber = (phone: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        phoneNumbers: prev.sms.phoneNumbers.filter(p => p !== phone)
      }
    }));
  };

  const handleSave = () => {
    const config = {
      thresholdRules,
      notificationSettings,
      timestamp: new Date()
    };
    
    onSave(config);
    toast({
      title: "Configuration Saved",
      description: "Alert configuration has been updated successfully",
    });
  };

  const handleReset = () => {
    // Reset to default values
    setThresholdRules([
      {
        id: 'battery-soc',
        name: 'Battery SOC Low',
        metric: 'battery_soc',
        operator: '<',
        value: 20,
        unit: '%',
        severity: 'critical',
        enabled: true
      },
      {
        id: 'voltage-high',
        name: 'Voltage High',
        metric: 'voltage',
        operator: '>',
        value: 240,
        unit: 'V',
        severity: 'warning',
        enabled: true
      },
      {
        id: 'load-high',
        name: 'Load High',
        metric: 'load',
        operator: '>',
        value: 5,
        unit: 'kW',
        severity: 'warning',
        enabled: true
      }
    ]);

    setAiConfig({
      enabled: true,
      confidenceThreshold: 0.8,
      models: {
        consumption: true,
        generation: true,
        storage: true,
        efficiency: false
      },
      sensitivityLevel: 'medium'
    });

    toast({
      title: "Configuration Reset",
      description: "Alert configuration has been reset to defaults",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getOperatorDisplay = (operator: string) => {
    switch (operator) {
      case '>': return '>';
      case '<': return '<';
      case '>=': return '>=';
      case '<=': return '<=';
      default: return operator;
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <Card className="hover-elevate">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Alert Configuration</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="text-xs"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Config
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="thresholds" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="thresholds" className="flex items-center space-x-2">
            <Gauge className="h-4 w-4" />
            <span>Threshold Rules</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Threshold Rules Tab */}
        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔧 Threshold Rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure threshold-based alert rules for system metrics
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {thresholdRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 border rounded-lg space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {rule.metric === 'battery_soc' && <Battery className="h-5 w-5 text-green-400" />}
                      {rule.metric === 'voltage' && <Zap className="h-5 w-5 text-blue-400" />}
                      {rule.metric === 'load' && <Gauge className="h-5 w-5 text-orange-400" />}
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rule.metric} {getOperatorDisplay(rule.operator)} {rule.value}{rule.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                        {rule.severity.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => updateThresholdRule(rule.id, { enabled })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Operator</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(operator: any) => updateThresholdRule(rule.id, { operator })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">Greater than (&gt;)</SelectItem>
                          <SelectItem value="<">Less than (&lt;)</SelectItem>
                          <SelectItem value=">=">Greater or equal (&gt;=)</SelectItem>
                          <SelectItem value="<=">Less or equal (&lt;=)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Threshold Value</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={rule.value}
                          onChange={(e) => updateThresholdRule(rule.id, { value: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">{rule.unit}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select
                        value={rule.severity}
                        onValueChange={(severity: any) => updateThresholdRule(rule.id, { severity })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📡 Notification System (Multi-channel Push)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how and where you receive alert notifications
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dashboard Notifications */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <Label className="text-base font-medium">Dashboard Notifications</Label>
                </div>
                <div className="pl-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Enable dashboard notifications</p>
                      <p className="text-xs text-muted-foreground">Show alerts in the dashboard interface</p>
                    </div>
                    <Switch
                      checked={notificationSettings.dashboard.enabled}
                      onCheckedChange={(enabled) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          dashboard: { ...prev.dashboard, enabled }
                        }))
                      }
                    />
                  </div>
                  {notificationSettings.dashboard.enabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Highlight cards</p>
                          <p className="text-xs text-muted-foreground">Highlight affected metric cards</p>
                        </div>
                        <Switch
                          checked={notificationSettings.dashboard.highlightCards}
                          onCheckedChange={(highlightCards) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              dashboard: { ...prev.dashboard, highlightCards }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Show notification badges</p>
                          <p className="text-xs text-muted-foreground">Display red notification badges</p>
                        </div>
                        <Switch
                          checked={notificationSettings.dashboard.showBadges}
                          onCheckedChange={(showBadges) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              dashboard: { ...prev.dashboard, showBadges }
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Email Notifications */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <Label className="text-base font-medium">Email Notifications</Label>
                </div>
                <div className="pl-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Enable email notifications</p>
                      <p className="text-xs text-muted-foreground">Send alerts via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email.enabled}
                      onCheckedChange={(enabled) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, enabled }
                        }))
                      }
                    />
                  </div>
                  
                  {notificationSettings.email.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Email Recipients</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter email address"
                            value={newEmailRecipient}
                            onChange={(e) => setNewEmailRecipient(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addEmailRecipient()}
                          />
                          <Button onClick={addEmailRecipient} size="sm">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {notificationSettings.email.recipients.map((email) => (
                            <Badge
                              key={email}
                              variant="outline"
                              className="cursor-pointer hover:bg-destructive/20"
                              onClick={() => removeEmailRecipient(email)}
                            >
                              {email} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* SMS Notifications */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  <Label className="text-base font-medium">SMS Notifications</Label>
                </div>
                <div className="pl-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Enable SMS notifications</p>
                      <p className="text-xs text-muted-foreground">Send critical alerts via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sms.enabled}
                      onCheckedChange={(enabled) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          sms: { ...prev.sms, enabled }
                        }))
                      }
                    />
                  </div>
                  
                  {notificationSettings.sms.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Phone Numbers</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter phone number"
                            value={newPhoneNumber}
                            onChange={(e) => setNewPhoneNumber(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addPhoneNumber()}
                          />
                          <Button onClick={addPhoneNumber} size="sm">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {notificationSettings.sms.phoneNumbers.map((phone) => (
                            <Badge
                              key={phone}
                              variant="outline"
                              className="cursor-pointer hover:bg-destructive/20"
                              onClick={() => removePhoneNumber(phone)}
                            >
                              {phone} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Priority Rules */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Priority Selection</Label>
                  <p className="text-sm text-muted-foreground">
                    Configure notification channels based on alert severity
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-red-500/5">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30">CRITICAL</Badge>
                      <span className="text-sm">→ SMS + Email + Dashboard</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-500/5">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">WARNING</Badge>
                      <span className="text-sm">→ Email + Dashboard</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-500/5">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">INFO</Badge>
                      <span className="text-sm">→ Dashboard</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
