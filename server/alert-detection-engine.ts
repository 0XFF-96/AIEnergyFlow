import { type EnergyMetric } from "@shared/schema";
import { type SensorData } from "@shared/alert-schema";
import { type AlertDetectionResult, type AlertSeverity, type AlertType } from "@shared/alert-schema";
import { aiAnomalyService } from "./ai-service";

export interface AlertRule {
  id: string;
  name: string;
  type: 'threshold' | 'pattern' | 'ai' | 'statistical';
  severity: AlertSeverity;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

export interface RuleCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'pattern';
  value: number | string;
  duration?: number; // seconds
  confidence?: number; // for AI conditions
}

export interface RuleAction {
  type: 'create_alert' | 'send_notification' | 'escalate' | 'log';
  config: Record<string, any>;
}

export class AlertDetectionEngine {
  private rules: AlertRule[] = [];
  private aiService: typeof aiAnomalyService;
  
  constructor(aiService: typeof aiAnomalyService) {
    this.aiService = aiService;
    this.initializeDefaultRules();
  }
  
  /**
   * Main detection method - processes energy metrics and sensor data
   */
  async detectAnomalies(energyMetrics: EnergyMetric[], sensorData: SensorData[] = []): Promise<AlertDetectionResult[]> {
    const alerts: AlertDetectionResult[] = [];
    
    // 1. AI-powered anomaly detection
    const aiAlerts = await this.performAIDetection(energyMetrics);
    alerts.push(...aiAlerts);
    
    // 2. Rule-based detection
    const ruleAlerts = await this.performRuleDetection(energyMetrics, sensorData);
    alerts.push(...ruleAlerts);
    
    // 3. Threshold monitoring
    const thresholdAlerts = await this.performThresholdDetection(energyMetrics, sensorData);
    alerts.push(...thresholdAlerts);
    
    // 4. Pattern analysis
    const patternAlerts = await this.performPatternAnalysis(energyMetrics);
    alerts.push(...patternAlerts);
    
    return this.deduplicateAndPrioritizeAlerts(alerts);
  }
  
  /**
   * AI-powered anomaly detection using existing AI service
   */
  private async performAIDetection(metrics: EnergyMetric[]): Promise<AlertDetectionResult[]> {
    try {
      const aiResult = await this.aiService.analyzeEnergyPattern(metrics);
      
      if (aiResult.isAnomaly) {
        return [{
          isAlert: true,
          severity: this.mapAISeverityToAlertSeverity(aiResult.severity || 'medium'),
          type: this.mapAITypeToAlertType(aiResult.type || 'unknown'),
          confidence: aiResult.score,
          description: aiResult.description || 'AI detected anomaly',
          affectedComponent: aiResult.affectedComponent,
          metadata: {
            aiConfidence: aiResult.score,
            aiType: aiResult.type,
            detectionMethod: 'ai_analysis'
          }
        }];
      }
    } catch (error) {
      console.error('AI detection failed:', error);
    }
    
    return [];
  }
  
  /**
   * Rule-based detection using configured rules
   */
  private async performRuleDetection(energyMetrics: EnergyMetric[], sensorData: SensorData[]): Promise<AlertDetectionResult[]> {
    const alerts: AlertDetectionResult[] = [];
    
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      
      try {
        if (await this.evaluateRule(rule, energyMetrics, sensorData)) {
          alerts.push(this.createAlertFromRule(rule, energyMetrics, sensorData));
        }
      } catch (error) {
        console.error(`Rule evaluation failed for ${rule.name}:`, error);
      }
    }
    
    return alerts;
  }
  
  /**
   * Threshold-based detection for critical values
   */
  private async performThresholdDetection(energyMetrics: EnergyMetric[], sensorData: SensorData[]): Promise<AlertDetectionResult[]> {
    const alerts: AlertDetectionResult[] = [];
    const latest = energyMetrics[energyMetrics.length - 1];
    
    if (!latest) return alerts;
    
    // Critical consumption threshold
    if (latest.consumption > 300) {
      alerts.push({
        isAlert: true,
        severity: 'critical',
        type: 'consumption',
        confidence: 0.95,
        description: `Critical consumption spike: ${latest.consumption.toFixed(1)} kW (threshold: 300 kW)`,
        affectedComponent: 'grid_load',
        metadata: {
          currentValue: latest.consumption,
          threshold: 300,
          detectionMethod: 'threshold'
        }
      });
    }
    
    // Critical storage threshold
    if (latest.storage < 10) {
      alerts.push({
        isAlert: true,
        severity: 'critical',
        type: 'storage',
        confidence: 0.98,
        description: `Critical battery level: ${latest.storage.toFixed(1)}% (minimum: 10%)`,
        affectedComponent: 'battery_system',
        metadata: {
          currentValue: latest.storage,
          threshold: 10,
          detectionMethod: 'threshold'
        }
      });
    }
    
    // Solar efficiency threshold
    if (latest.solarEfficiency < 50) {
      alerts.push({
        isAlert: true,
        severity: 'warning',
        type: 'generation',
        confidence: 0.85,
        description: `Solar efficiency degraded: ${latest.solarEfficiency.toFixed(1)}% (normal: >75%)`,
        affectedComponent: 'solar_panels',
        metadata: {
          currentValue: latest.solarEfficiency,
          threshold: 50,
          detectionMethod: 'threshold'
        }
      });
    }
    
    // Battery health threshold
    if (latest.batteryHealth < 85) {
      alerts.push({
        isAlert: true,
        severity: 'warning',
        type: 'device_fault',
        confidence: 0.80,
        description: `Battery health degraded: ${latest.batteryHealth.toFixed(1)}% (normal: >90%)`,
        affectedComponent: 'battery_system',
        metadata: {
          currentValue: latest.batteryHealth,
          threshold: 85,
          detectionMethod: 'threshold'
        }
      });
    }
    
    return alerts;
  }
  
  /**
   * Pattern analysis for trend detection
   */
  private async performPatternAnalysis(metrics: EnergyMetric[]): Promise<AlertDetectionResult[]> {
    const alerts: AlertDetectionResult[] = [];
    
    if (metrics.length < 10) return alerts; // Need sufficient data
    
    // Analyze consumption trend
    const consumptionTrend = this.analyzeTrend(metrics.map(m => m.consumption));
    if (consumptionTrend.isIncreasing && consumptionTrend.rate > 0.1) {
      alerts.push({
        isAlert: true,
        severity: 'warning',
        type: 'consumption',
        confidence: 0.75,
        description: `Consumption trend increasing: ${(consumptionTrend.rate * 100).toFixed(1)}% per hour`,
        affectedComponent: 'grid_load',
        metadata: {
          trend: consumptionTrend,
          detectionMethod: 'pattern_analysis'
        }
      });
    }
    
    // Analyze generation drop
    const generationTrend = this.analyzeTrend(metrics.map(m => m.generation));
    if (generationTrend.isDecreasing && generationTrend.rate < -0.15) {
      alerts.push({
        isAlert: true,
        severity: 'warning',
        type: 'generation',
        confidence: 0.80,
        description: `Generation dropping: ${(generationTrend.rate * 100).toFixed(1)}% per hour`,
        affectedComponent: 'solar_panels',
        metadata: {
          trend: generationTrend,
          detectionMethod: 'pattern_analysis'
        }
      });
    }
    
    return alerts;
  }
  
  /**
   * Evaluate a specific rule against data
   */
  private async evaluateRule(rule: AlertRule, energyMetrics: EnergyMetric[], sensorData: SensorData[]): Promise<boolean> {
    for (const condition of rule.conditions) {
      if (!await this.evaluateCondition(condition, energyMetrics, sensorData)) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(condition: RuleCondition, energyMetrics: EnergyMetric[], sensorData: SensorData[]): Promise<boolean> {
    const latest = energyMetrics[energyMetrics.length - 1];
    if (!latest) return false;
    
    let value: number;
    switch (condition.metric) {
      case 'consumption':
        value = latest.consumption;
        break;
      case 'generation':
        value = latest.generation;
        break;
      case 'storage':
        value = latest.storage;
        break;
      case 'solarEfficiency':
        value = latest.solarEfficiency;
        break;
      case 'batteryHealth':
        value = latest.batteryHealth;
        break;
      default:
        return false;
    }
    
    switch (condition.operator) {
      case '>':
        return value > (condition.value as number);
      case '<':
        return value < (condition.value as number);
      case '>=':
        return value >= (condition.value as number);
      case '<=':
        return value <= (condition.value as number);
      case '==':
        return value === (condition.value as number);
      case '!=':
        return value !== (condition.value as number);
      default:
        return false;
    }
  }
  
  /**
   * Create alert from rule evaluation
   */
  private createAlertFromRule(rule: AlertRule, energyMetrics: EnergyMetric[], sensorData: SensorData[]): AlertDetectionResult {
    const latest = energyMetrics[energyMetrics.length - 1];
    
    return {
      isAlert: true,
      severity: rule.severity,
      type: this.inferTypeFromRule(rule),
      confidence: 0.9, // Rule-based alerts have high confidence
      description: `Rule triggered: ${rule.name}`,
      affectedComponent: this.inferComponentFromRule(rule),
      metadata: {
        ruleId: rule.id,
        ruleName: rule.name,
        currentValues: latest,
        detectionMethod: 'rule_based'
      }
    };
  }
  
  /**
   * Analyze trend in data series
   */
  private analyzeTrend(data: number[]): { isIncreasing: boolean; isDecreasing: boolean; rate: number } {
    if (data.length < 2) return { isIncreasing: false, isDecreasing: false, rate: 0 };
    
    const first = data[0];
    const last = data[data.length - 1];
    const rate = (last - first) / first;
    
    return {
      isIncreasing: rate > 0.05,
      isDecreasing: rate < -0.05,
      rate
    };
  }
  
  /**
   * Deduplicate and prioritize alerts
   */
  private deduplicateAndPrioritizeAlerts(alerts: AlertDetectionResult[]): AlertDetectionResult[] {
    // Remove duplicates based on type and severity
    const seen = new Set<string>();
    const unique = alerts.filter(alert => {
      const key = `${alert.type}-${alert.severity}-${alert.affectedComponent}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Sort by severity (critical > warning > info)
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    return unique.sort((a, b) => 
      severityOrder[b.severity] - severityOrder[a.severity]
    );
  }
  
  /**
   * Initialize default detection rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'consumption-spike',
        name: 'Consumption Spike Detection',
        type: 'threshold',
        severity: 'critical',
        conditions: [
          { metric: 'consumption', operator: '>', value: 250 }
        ],
        actions: [
          { type: 'create_alert', config: {} },
          { type: 'send_notification', config: { channels: ['email', 'sms'] } }
        ],
        enabled: true
      },
      {
        id: 'battery-critical',
        name: 'Battery Critical Level',
        type: 'threshold',
        severity: 'critical',
        conditions: [
          { metric: 'storage', operator: '<', value: 15 }
        ],
        actions: [
          { type: 'create_alert', config: {} },
          { type: 'escalate', config: { delay: 5 } }
        ],
        enabled: true
      },
      {
        id: 'solar-degradation',
        name: 'Solar Panel Degradation',
        type: 'threshold',
        severity: 'warning',
        conditions: [
          { metric: 'solarEfficiency', operator: '<', value: 70 }
        ],
        actions: [
          { type: 'create_alert', config: {} }
        ],
        enabled: true
      }
    ];
  }
  
  // Helper methods for mapping AI results to alert system
  private mapAISeverityToAlertSeverity(aiSeverity: string): AlertSeverity {
    switch (aiSeverity) {
      case 'critical': return 'critical';
      case 'high': return 'critical';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'warning';
    }
  }
  
  private mapAITypeToAlertType(aiType: string): AlertType {
    switch (aiType) {
      case 'consumption': return 'consumption';
      case 'generation': return 'generation';
      case 'storage': return 'storage';
      case 'device_fault': return 'device_fault';
      default: return 'anomaly';
    }
  }
  
  private inferTypeFromRule(rule: AlertRule): AlertType {
    if (rule.name.toLowerCase().includes('consumption')) return 'consumption';
    if (rule.name.toLowerCase().includes('battery') || rule.name.toLowerCase().includes('storage')) return 'storage';
    if (rule.name.toLowerCase().includes('solar') || rule.name.toLowerCase().includes('generation')) return 'generation';
    if (rule.name.toLowerCase().includes('device') || rule.name.toLowerCase().includes('fault')) return 'device_fault';
    return 'system_health';
  }
  
  private inferComponentFromRule(rule: AlertRule): string {
    if (rule.name.toLowerCase().includes('consumption')) return 'grid_load';
    if (rule.name.toLowerCase().includes('battery')) return 'battery_system';
    if (rule.name.toLowerCase().includes('solar')) return 'solar_panels';
    return 'system';
  }
}

export const alertDetectionEngine = new AlertDetectionEngine(aiAnomalyService);
