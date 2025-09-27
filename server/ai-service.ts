import OpenAI from "openai";
import { type EnergyMetric, type InsertAnomaly } from "@shared/schema";

// Using OpenAI integration for AI-powered anomaly detection
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AnomalyAnalysisResult {
  isAnomaly: boolean;
  score: number; // 0-1 confidence score
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  affectedComponent?: string;
}

export class AIAnomalyDetectionService {
  private readonly normalRanges = {
    consumption: { min: 80, max: 250 }, // kW
    generation: { min: 0, max: 120 }, // kW  
    storage: { min: 15, max: 95 }, // percentage
    solarEfficiency: { min: 75, max: 98 }, // percentage
    batteryHealth: { min: 90, max: 100 }, // percentage
  };

  async analyzeEnergyPattern(metrics: EnergyMetric[]): Promise<AnomalyAnalysisResult> {
    if (metrics.length === 0) {
      return { isAnomaly: false, score: 0 };
    }

    const latest = metrics[metrics.length - 1];
    const historical = metrics.slice(-24); // Last 24 readings

    // Quick rule-based check for obvious anomalies
    const ruleBasedAnomaly = this.detectRuleBasedAnomalies(latest);
    if (ruleBasedAnomaly.isAnomaly) {
      return ruleBasedAnomaly;
    }

    // AI-powered pattern analysis for subtle anomalies
    try {
      return await this.performAIAnalysis(latest, historical);
    } catch (error) {
      console.error('AI analysis failed, falling back to rule-based:', error);
      return { isAnomaly: false, score: 0 };
    }
  }

  private detectRuleBasedAnomalies(metric: EnergyMetric): AnomalyAnalysisResult {
    // Critical threshold violations
    if (metric.consumption > 300) {
      return {
        isAnomaly: true,
        score: 0.95,
        type: 'consumption',
        severity: 'critical',
        description: `Extreme consumption spike: ${metric.consumption.toFixed(1)} kW (normal range: ${this.normalRanges.consumption.min}-${this.normalRanges.consumption.max} kW)`,
        affectedComponent: 'grid_load'
      };
    }

    if (metric.storage < 5) {
      return {
        isAnomaly: true,
        score: 0.90,
        type: 'storage',
        severity: 'critical',
        description: `Critical battery level: ${metric.storage.toFixed(1)}% (minimum safe level: 15%)`,
        affectedComponent: 'battery_system'
      };
    }

    if (metric.solarEfficiency < 50) {
      return {
        isAnomaly: true,
        score: 0.85,
        type: 'generation',
        severity: 'high',
        description: `Solar panel efficiency critically low: ${metric.solarEfficiency.toFixed(1)}% (normal range: ${this.normalRanges.solarEfficiency.min}-${this.normalRanges.solarEfficiency.max}%)`,
        affectedComponent: 'solar_panels'
      };
    }

    if (metric.batteryHealth < 85) {
      return {
        isAnomaly: true,
        score: 0.80,
        type: 'device_fault',
        severity: 'medium',
        description: `Battery health degraded: ${metric.batteryHealth.toFixed(1)}% (normal range: ${this.normalRanges.batteryHealth.min}-${this.normalRanges.batteryHealth.max}%)`,
        affectedComponent: 'battery_system'
      };
    }

    return { isAnomaly: false, score: 0 };
  }

  private async performAIAnalysis(current: EnergyMetric, historical: EnergyMetric[]): Promise<AnomalyAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(current, historical);

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert energy systems analyst specializing in microgrid anomaly detection. Analyze energy patterns and detect unusual behavior that could indicate equipment issues, unauthorized usage, or system inefficiencies. Respond with JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isAnomaly: result.isAnomaly || false,
      score: Math.min(1, Math.max(0, result.score || 0)),
      type: result.type,
      severity: result.severity,
      description: result.description,
      affectedComponent: result.affectedComponent
    };
  }

  private buildAnalysisPrompt(current: EnergyMetric, historical: EnergyMetric[]): string {
    const historicalStats = this.calculateStatistics(historical);
    const hour = current.timestamp.getHours();
    const isNightTime = hour < 6 || hour > 20;
    
    return `Analyze this energy reading for anomalies:

CURRENT READING (${current.timestamp.toISOString()}):
- Consumption: ${current.consumption} kW
- Generation: ${current.generation} kW
- Storage: ${current.storage}%
- Grid Export: ${current.gridExport} kW
- Solar Efficiency: ${current.solarEfficiency}%
- Battery Health: ${current.batteryHealth}%
- Time: ${hour}:00 (${isNightTime ? 'Night' : 'Day'})

HISTORICAL AVERAGES (last ${historical.length} readings):
- Avg Consumption: ${historicalStats.avgConsumption.toFixed(1)} kW
- Avg Generation: ${historicalStats.avgGeneration.toFixed(1)} kW
- Avg Storage: ${historicalStats.avgStorage.toFixed(1)}%
- Std Dev Consumption: ${historicalStats.stdConsumption.toFixed(1)} kW
- Std Dev Generation: ${historicalStats.stdGeneration.toFixed(1)} kW

NORMAL OPERATING RANGES:
- Consumption: ${this.normalRanges.consumption.min}-${this.normalRanges.consumption.max} kW
- Generation: ${this.normalRanges.generation.min}-${this.normalRanges.generation.max} kW
- Storage: ${this.normalRanges.storage.min}-${this.normalRanges.storage.max}%
- Solar Efficiency: ${this.normalRanges.solarEfficiency.min}-${this.normalRanges.solarEfficiency.max}%
- Battery Health: ${this.normalRanges.batteryHealth.min}-${this.normalRanges.batteryHealth.max}%

Detect anomalies considering:
1. Deviations from historical patterns
2. Time-of-day expectations (night vs day)
3. Statistical outliers (>2 standard deviations)
4. Equipment health indicators
5. Energy balance inconsistencies

Respond with JSON format:
{
  "isAnomaly": boolean,
  "score": number (0-1 confidence),
  "type": "consumption" | "generation" | "storage" | "device_fault",
  "severity": "low" | "medium" | "high" | "critical",
  "description": "Detailed explanation",
  "affectedComponent": "component name"
}`;
  }

  private calculateStatistics(metrics: EnergyMetric[]) {
    if (metrics.length === 0) {
      return {
        avgConsumption: 0, avgGeneration: 0, avgStorage: 0,
        stdConsumption: 0, stdGeneration: 0
      };
    }

    const consumption = metrics.map(m => m.consumption);
    const generation = metrics.map(m => m.generation);
    const storage = metrics.map(m => m.storage);

    const avgConsumption = consumption.reduce((a, b) => a + b, 0) / consumption.length;
    const avgGeneration = generation.reduce((a, b) => a + b, 0) / generation.length;
    const avgStorage = storage.reduce((a, b) => a + b, 0) / storage.length;

    const stdConsumption = Math.sqrt(
      consumption.reduce((acc, val) => acc + Math.pow(val - avgConsumption, 2), 0) / consumption.length
    );
    const stdGeneration = Math.sqrt(
      generation.reduce((acc, val) => acc + Math.pow(val - avgGeneration, 2), 0) / generation.length
    );

    return {
      avgConsumption,
      avgGeneration,
      avgStorage,
      stdConsumption,
      stdGeneration
    };
  }

  async generateDailyInsights(metrics: EnergyMetric[]): Promise<string> {
    const stats = this.calculateStatistics(metrics);
    const totalConsumption = metrics.reduce((sum, m) => sum + m.consumption, 0) / 1000; // Convert to kWh
    const totalGeneration = metrics.reduce((sum, m) => sum + m.generation, 0) / 1000;
    
    const prompt = `Generate daily energy insights based on this data:

DAILY SUMMARY:
- Total Consumption: ${totalConsumption.toFixed(1)} kWh
- Total Generation: ${totalGeneration.toFixed(1)} kWh
- Net Energy: ${(totalGeneration - totalConsumption).toFixed(1)} kWh
- Average Storage: ${stats.avgStorage.toFixed(1)}%
- Data Points: ${metrics.length} readings

Provide insights on:
1. Energy efficiency performance
2. Solar generation optimization opportunities
3. Consumption pattern observations
4. Recommendations for improvement

Keep response concise and actionable (max 200 words).`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an energy efficiency consultant. Provide clear, actionable insights for microgrid operators."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      });

      return response.choices[0].message.content || "Unable to generate insights at this time.";
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      return `Daily Summary: ${totalConsumption.toFixed(1)} kWh consumed, ${totalGeneration.toFixed(1)} kWh generated. Net energy: ${(totalGeneration - totalConsumption).toFixed(1)} kWh. System operating within normal parameters.`;
    }
  }
}

export const aiAnomalyService = new AIAnomalyDetectionService();