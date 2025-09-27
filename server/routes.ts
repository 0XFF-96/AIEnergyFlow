import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, energySimulator } from "./storage";
import { aiAnomalyService } from "./ai-service";
import { insertEnergyMetricSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Energy metrics endpoints
  app.get("/api/energy/current", async (req, res) => {
    try {
      const recentMetrics = await storage.getRecentEnergyMetrics(1);
      const currentMetric = recentMetrics[0] || null;
      res.json({ metric: currentMetric });
    } catch (error) {
      console.error('Error fetching current energy metric:', error);
      res.status(500).json({ error: 'Failed to fetch current energy data' });
    }
  });

  app.get("/api/energy/metrics", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const metrics = await storage.getRecentEnergyMetrics(hours);
      res.json({ metrics });
    } catch (error) {
      console.error('Error fetching energy metrics:', error);
      res.status(500).json({ error: 'Failed to fetch energy metrics' });
    }
  });

  app.post("/api/energy/simulate", async (req, res) => {
    try {
      const { type } = req.body;
      let metric;
      
      if (type === 'anomaly') {
        const anomalyType = req.body.anomalyType || 'consumption_spike';
        metric = energySimulator.generateAnomalousMetric(anomalyType);
      } else {
        metric = energySimulator.generateRealisticMetric();
      }
      
      const savedMetric = await storage.addEnergyMetric(metric);
      
      // Check for anomalies in the new data
      const recentMetrics = await storage.getRecentEnergyMetrics(24);
      const anomalyResult = await aiAnomalyService.analyzeEnergyPattern(recentMetrics);
      
      if (anomalyResult.isAnomaly) {
        // Create anomaly record
        const anomaly = await storage.addAnomaly({
          type: anomalyResult.type || 'unknown',
          severity: anomalyResult.severity || 'medium',
          score: anomalyResult.score,
          description: anomalyResult.description || 'Anomaly detected',
          affectedComponent: anomalyResult.affectedComponent,
        });
        
        // Create alert
        await storage.addAlert({
          title: `AI Anomaly Detected`,
          description: anomalyResult.description || 'Unusual energy pattern detected',
          type: 'anomaly',
          anomalyId: anomaly.id,
        });
      }
      
      res.json({ 
        metric: savedMetric, 
        anomalyDetected: anomalyResult.isAnomaly,
        anomalyScore: anomalyResult.score 
      });
    } catch (error) {
      console.error('Error simulating energy data:', error);
      res.status(500).json({ error: 'Failed to simulate energy data' });
    }
  });

  // Anomaly detection endpoints
  app.get("/api/anomalies", async (req, res) => {
    try {
      const anomalies = await storage.getActiveAnomalies();
      res.json({ anomalies });
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      res.status(500).json({ error: 'Failed to fetch anomalies' });
    }
  });

  app.post("/api/anomalies/:id/resolve", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.resolveAnomaly(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error resolving anomaly:', error);
      res.status(500).json({ error: 'Failed to resolve anomaly' });
    }
  });

  app.post("/api/anomalies/analyze", async (req, res) => {
    try {
      const recentMetrics = await storage.getRecentEnergyMetrics(24);
      const analysis = await aiAnomalyService.analyzeEnergyPattern(recentMetrics);
      res.json({ analysis });
    } catch (error) {
      console.error('Error analyzing energy patterns:', error);
      res.status(500).json({ error: 'Failed to analyze energy patterns' });
    }
  });

  // Alert management endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json({ alerts });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.post("/api/alerts/:id/dismiss", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.dismissAlert(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error dismissing alert:', error);
      res.status(500).json({ error: 'Failed to dismiss alert' });
    }
  });

  // Dashboard summary endpoint
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const recentMetrics = await storage.getRecentEnergyMetrics(24);
      const currentMetric = recentMetrics[recentMetrics.length - 1];
      const activeAlerts = await storage.getActiveAlerts();
      const activeAnomalies = await storage.getActiveAnomalies();
      
      // Calculate daily totals
      const dailyConsumption = recentMetrics.reduce((sum, m) => sum + m.consumption, 0) / 1000; // kWh
      const dailyGeneration = recentMetrics.reduce((sum, m) => sum + m.generation, 0) / 1000; // kWh
      const co2Saved = dailyGeneration * 0.4; // Rough estimate: 0.4 kg CO2 per kWh
      
      // Chart data for last 24 hours (every 2 hours)
      const chartData = recentMetrics
        .filter((_, index) => index % 8 === 0) // Every 8th reading (roughly 2-hour intervals)
        .slice(-12) // Last 12 data points
        .map(metric => ({
          time: metric.timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }),
          consumption: Math.round(metric.consumption * 10) / 10,
          generation: Math.round(metric.generation * 10) / 10,
          storage: Math.round(metric.storage * 10) / 10,
        }));
      
      res.json({
        current: currentMetric,
        alerts: activeAlerts,
        anomalies: activeAnomalies,
        dailyTotals: {
          consumption: Math.round(dailyConsumption * 10) / 10,
          generation: Math.round(dailyGeneration * 10) / 10,
          co2Saved: Math.round(co2Saved * 10) / 10,
        },
        chartData,
        systemStatus: {
          solarPanels: currentMetric?.solarEfficiency > 75 ? 'online' : 'degraded',
          battery: currentMetric?.storage > 15 ? 'normal' : 'low',
          gridConnection: 'stable',
          aiMonitoring: 'active',
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  });

  // AI insights endpoint
  app.get("/api/ai/insights", async (req, res) => {
    try {
      const recentMetrics = await storage.getRecentEnergyMetrics(24);
      const insights = await aiAnomalyService.generateDailyInsights(recentMetrics);
      res.json({ insights });
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({ error: 'Failed to generate AI insights' });
    }
  });

  // Initialize with some sample data
  app.post("/api/system/initialize", async (req, res) => {
    try {
      const { userRole, microgridLocation } = req.body;
      
      // Generate initial historical data (last 24 hours)
      const promises = [];
      for (let i = 0; i < 24; i++) {
        const metric = energySimulator.generateRealisticMetric();
        promises.push(storage.addEnergyMetric(metric));
      }
      
      await Promise.all(promises);
      
      // Add a sample anomaly for demonstration
      const anomalyMetric = energySimulator.generateAnomalousMetric('consumption_spike');
      await storage.addEnergyMetric(anomalyMetric);
      
      const anomaly = await storage.addAnomaly({
        type: 'consumption',
        severity: 'high',
        score: 0.87,
        description: 'Unusual consumption pattern detected in Zone 3. Potential equipment malfunction or unauthorized usage.',
        affectedComponent: 'zone_3_equipment',
      });
      
      await storage.addAlert({
        title: 'AI Anomaly Detected',
        description: 'Unusual consumption pattern detected in Zone 3. Anomaly score: 0.87',
        type: 'anomaly',
        anomalyId: anomaly.id,
      });
      
      // Store user preferences in session or local storage equivalent
      const userPreferences = {
        role: userRole || 'operator',
        location: microgridLocation || 'north-perth',
        initializedAt: new Date().toISOString(),
      };
      
      console.log('System initialized with user preferences:', userPreferences);
      
      res.json({ 
        success: true, 
        message: 'System initialized with sample data',
        userPreferences,
        dashboardUrl: `/dashboard?role=${userRole}&location=${microgridLocation}`
      });
    } catch (error) {
      console.error('Error initializing system:', error);
      res.status(500).json({ error: 'Failed to initialize system' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
