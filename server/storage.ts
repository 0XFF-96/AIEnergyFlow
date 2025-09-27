import { 
  type User, type InsertUser,
  type EnergyMetric, type InsertEnergyMetric,
  type Anomaly, type InsertAnomaly,
  type Alert, type InsertAlert,
  type DailyReport, type InsertDailyReport
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for energy management system
export interface IStorage {
  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Energy metrics
  addEnergyMetric(metric: InsertEnergyMetric): Promise<EnergyMetric>;
  getRecentEnergyMetrics(hours?: number): Promise<EnergyMetric[]>;
  getEnergyMetricsByDateRange(startDate: Date, endDate: Date): Promise<EnergyMetric[]>;
  
  // Anomaly detection
  addAnomaly(anomaly: InsertAnomaly): Promise<Anomaly>;
  getActiveAnomalies(): Promise<Anomaly[]>;
  resolveAnomaly(id: string): Promise<void>;
  
  // Alert management
  addAlert(alert: InsertAlert): Promise<Alert>;
  getActiveAlerts(): Promise<Alert[]>;
  dismissAlert(id: string): Promise<void>;
  
  // Daily reports
  addDailyReport(report: InsertDailyReport): Promise<DailyReport>;
  getDailyReports(days?: number): Promise<DailyReport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private energyMetrics: Map<string, EnergyMetric>;
  private anomalies: Map<string, Anomaly>;
  private alerts: Map<string, Alert>;
  private dailyReports: Map<string, DailyReport>;

  constructor() {
    this.users = new Map();
    this.energyMetrics = new Map();
    this.anomalies = new Map();
    this.alerts = new Map();
    this.dailyReports = new Map();
  }

  // User methods (legacy)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Energy metrics
  async addEnergyMetric(metric: InsertEnergyMetric): Promise<EnergyMetric> {
    const id = randomUUID();
    const energyMetric: EnergyMetric = {
      ...metric,
      id,
      timestamp: new Date(),
    };
    this.energyMetrics.set(id, energyMetric);
    return energyMetric;
  }

  async getRecentEnergyMetrics(hours: number = 24): Promise<EnergyMetric[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.energyMetrics.values())
      .filter(metric => metric.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getEnergyMetricsByDateRange(startDate: Date, endDate: Date): Promise<EnergyMetric[]> {
    return Array.from(this.energyMetrics.values())
      .filter(metric => metric.timestamp >= startDate && metric.timestamp <= endDate)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Anomaly detection
  async addAnomaly(anomaly: InsertAnomaly): Promise<Anomaly> {
    const id = randomUUID();
    const anomalyRecord: Anomaly = {
      ...anomaly,
      id,
      timestamp: new Date(),
      resolved: false,
      resolvedAt: null,
      affectedComponent: anomaly.affectedComponent ?? null,
    };
    this.anomalies.set(id, anomalyRecord);
    return anomalyRecord;
  }

  async getActiveAnomalies(): Promise<Anomaly[]> {
    return Array.from(this.anomalies.values())
      .filter(anomaly => !anomaly.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async resolveAnomaly(id: string): Promise<void> {
    const anomaly = this.anomalies.get(id);
    if (anomaly) {
      anomaly.resolved = true;
      anomaly.resolvedAt = new Date();
      this.anomalies.set(id, anomaly);
    }
  }

  // Alert management
  async addAlert(alert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alertRecord: Alert = {
      ...alert,
      id,
      timestamp: new Date(),
      dismissed: false,
      dismissedAt: null,
      anomalyId: alert.anomalyId ?? null,
    };
    this.alerts.set(id, alertRecord);
    return alertRecord;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.dismissed)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async dismissAlert(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.dismissed = true;
      alert.dismissedAt = new Date();
      this.alerts.set(id, alert);
    }
  }

  // Daily reports
  async addDailyReport(report: InsertDailyReport): Promise<DailyReport> {
    const id = randomUUID();
    const dailyReport: DailyReport = {
      ...report,
      id,
    };
    this.dailyReports.set(id, dailyReport);
    return dailyReport;
  }

  async getDailyReports(days: number = 7): Promise<DailyReport[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Array.from(this.dailyReports.values())
      .filter(report => report.date >= cutoff)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}

export const storage = new MemStorage();

// Energy data simulation engine
export class EnergyDataSimulator {
  private baseConsumption = 150; // kW
  private baseGeneration = 80; // kW
  private baseStorage = 75; // percentage
  private lastUpdate = Date.now();

  generateRealisticMetric(): InsertEnergyMetric {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Solar generation pattern (peaks at noon)
    const solarMultiplier = Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
    const generation = this.baseGeneration * solarMultiplier * (0.8 + Math.random() * 0.4);
    
    // Consumption pattern (higher during day and evening)
    const consumptionMultiplier = 0.7 + 0.3 * Math.sin((hour - 8) * Math.PI / 8) + 0.2 * Math.random();
    const consumption = this.baseConsumption * consumptionMultiplier;
    
    // Storage varies based on generation vs consumption
    const netPower = generation - consumption;
    let storage = this.baseStorage + (netPower / 100) * 10; // Adjust storage based on net power
    storage = Math.max(10, Math.min(95, storage + (Math.random() - 0.5) * 5));
    this.baseStorage = storage;
    
    // Grid export is excess generation
    const gridExport = Math.max(0, generation - consumption);
    
    // System efficiency metrics
    const solarEfficiency = 85 + Math.random() * 10; // 85-95%
    const batteryHealth = 95 + Math.random() * 4; // 95-99%
    
    return {
      consumption: Math.round(consumption * 10) / 10,
      generation: Math.round(generation * 10) / 10,
      storage: Math.round(storage * 10) / 10,
      gridExport: Math.round(gridExport * 10) / 10,
      solarEfficiency: Math.round(solarEfficiency * 10) / 10,
      batteryHealth: Math.round(batteryHealth * 10) / 10,
    };
  }

  // Simulate anomalous data for testing
  generateAnomalousMetric(anomalyType: 'consumption_spike' | 'generation_drop' | 'storage_drain'): InsertEnergyMetric {
    const normal = this.generateRealisticMetric();
    
    switch (anomalyType) {
      case 'consumption_spike':
        return { ...normal, consumption: normal.consumption * 2.5 };
      case 'generation_drop':
        return { ...normal, generation: normal.generation * 0.3, solarEfficiency: 45 };
      case 'storage_drain':
        return { ...normal, storage: Math.max(5, normal.storage * 0.2) };
      default:
        return normal;
    }
  }
}

export const energySimulator = new EnergyDataSimulator();
