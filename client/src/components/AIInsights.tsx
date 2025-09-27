import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, TrendingUp, Brain, Activity, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AIInsightsProps {
  alerts?: any[];
  onRefresh?: () => void;
}

interface AIInsightsData {
  insights: string;
  anomalyDetection: {
    status: 'active' | 'inactive' | 'learning';
    confidence: number;
  };
  patternAnalysis: {
    status: 'learning' | 'ready' | 'analyzing';
    patterns: number;
  };
  systemHealth: number;
  activeAlerts: number;
}

function AIInsights({ alerts = [], onRefresh }: AIInsightsProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch AI insights
  const { data: aiInsights, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/ai/insights'],
    refetchInterval: 60000, // Refresh every minute
  });

  const insightsData: AIInsightsData = {
    insights: aiInsights?.insights || "Analyzing energy patterns and system performance...",
    anomalyDetection: {
      status: 'active',
      confidence: 0.87
    },
    patternAnalysis: {
      status: 'learning',
      patterns: 15
    },
    systemHealth: 94.7,
    activeAlerts: alerts.length
  };

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
    toast({
      title: "AI Insights Refreshed",
      description: "Latest analysis and patterns have been updated.",
    });
  };

  const handleViewDetailed = () => {
    setIsExpanded(true);
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-purple-400" />
                <span className="text-xl">AI Insights Dashboard</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <div>
                        <p className="text-sm text-muted-foreground">Anomaly Detection</p>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {insightsData.anomalyDetection.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pattern Analysis</p>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          {insightsData.patternAnalysis.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Alerts</p>
                        <p className="text-lg font-semibold text-yellow-300">
                          {insightsData.activeAlerts}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-sm text-muted-foreground">System Health</p>
                        <p className="text-lg font-semibold text-blue-300">
                          {insightsData.systemHealth}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <span>AI Daily Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed">
                        {isLoading ? "Analyzing energy patterns..." : insightsData.insights}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pattern Analysis Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <span>Pattern Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Energy Consumption Patterns</h4>
                        <p className="text-sm text-muted-foreground">
                          Peak usage detected at 2:00 PM - 4:00 PM daily
                        </p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Pattern Detected
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Generation Efficiency</h4>
                        <p className="text-sm text-muted-foreground">
                          Solar generation peaks at 12:00 PM - 1:00 PM
                        </p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Optimal Window
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-purple-400" />
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Anomaly Detection</span>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            {insightsData.anomalyDetection.status}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Pattern Analysis</span>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            {insightsData.patternAnalysis.status}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Active Alerts</span>
          <span className="font-mono text-sm text-yellow-300">
            {insightsData.activeAlerts}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">System Health</span>
          <span className="font-mono text-sm text-green-400">
            {insightsData.systemHealth}%
          </span>
        </div>
        
        {insightsData.insights && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <h4 className="text-sm font-medium mb-2">AI Daily Insights</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {insightsData.insights}
            </p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleViewDetailed}
          className="w-full flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>View Detailed Insights</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export default AIInsights;
