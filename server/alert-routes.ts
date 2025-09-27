import type { Express } from "express";
import { alertDetectionEngine } from "./alert-detection-engine";
import { notificationService } from "./notification-service";
import { storage } from "./storage";
import { z } from "zod";

// Extended route registrations for Alert System
export async function registerAlertRoutes(app: Express): Promise<void> {
  
  // Get all alerts with filtering and pagination
  app.get("/api/alerts", async (req, res) => {
    try {
      const {
        severity,
        type,
        status,
        limit = "50",
        offset = "0",
        search,
        dateRange = "7d"
      } = req.query;
      
      // Get alerts with filters (would implement proper filtering in storage)
      const alerts = await storage.getActiveAlerts();
      
      // Apply client-side filtering for demo
      let filteredAlerts = alerts;
      
      if (severity && severity !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => 
          (alert as any).severity === severity
        );
      }
      
      if (type && type !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.type === type
        );
      }
      
      if (status && status !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => 
          (alert as any).status === status
        );
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.title.toLowerCase().includes(searchTerm) ||
          alert.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Pagination
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const paginatedAlerts = filteredAlerts.slice(offsetNum, offsetNum + limitNum);
      
      res.json({
        alerts: paginatedAlerts,
        total: filteredAlerts.length,
        limit: limitNum,
        offset: offsetNum
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });
  
  // Get alert by ID with full details
  app.get("/api/alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // In a real implementation, this would fetch from storage
      const alerts = await storage.getActiveAlerts();
      const alert = alerts.find(a => a.id === id);
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      // Get alert interactions/timeline
      const interactions = await getAlertInteractions(id);
      
      res.json({
        alert,
        interactions,
        timeline: interactions // For now, same as interactions
      });
    } catch (error) {
      console.error('Error fetching alert details:', error);
      res.status(500).json({ error: 'Failed to fetch alert details' });
    }
  });
  
  // Acknowledge alert
  app.post("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId = 'system', notes } = req.body;
      
      // Update alert status
      await updateAlertStatus(id, 'acknowledged', userId, notes);
      
      // Record interaction
      await recordAlertInteraction(id, userId, 'acknowledge', notes);
      
      res.json({ success: true, message: 'Alert acknowledged' });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
  });
  
  // Resolve alert
  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId = 'system', notes } = req.body;
      
      // Update alert status
      await updateAlertStatus(id, 'resolved', userId, notes);
      
      // Record interaction
      await recordAlertInteraction(id, userId, 'resolve', notes);
      
      res.json({ success: true, message: 'Alert resolved' });
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({ error: 'Failed to resolve alert' });
    }
  });
  
  // Dismiss alert
  app.post("/api/alerts/:id/dismiss", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId = 'system', notes } = req.body;
      
      // Dismiss alert (existing functionality)
      await storage.dismissAlert(id);
      
      // Record interaction
      await recordAlertInteraction(id, userId, 'dismiss', notes);
      
      res.json({ success: true, message: 'Alert dismissed' });
    } catch (error) {
      console.error('Error dismissing alert:', error);
      res.status(500).json({ error: 'Failed to dismiss alert' });
    }
  });
  
  // Add notes to alert
  app.post("/api/alerts/:id/notes", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId = 'system', notes } = req.body;
      
      if (!notes) {
        return res.status(400).json({ error: 'Notes are required' });
      }
      
      // Record interaction with notes
      await recordAlertInteraction(id, userId, 'add_notes', notes);
      
      res.json({ success: true, message: 'Notes added successfully' });
    } catch (error) {
      console.error('Error adding notes:', error);
      res.status(500).json({ error: 'Failed to add notes' });
    }
  });
  
  // Get alert statistics
  app.get("/api/alerts/stats", async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      
      const alerts = await storage.getActiveAlerts();
      
      // Calculate statistics
      const stats = {
        total: alerts.length,
        active: alerts.filter(a => !(a as any).dismissed).length,
        resolved: alerts.filter(a => (a as any).dismissed).length,
        critical: alerts.filter(a => (a as any).severity === 'critical').length,
        warning: alerts.filter(a => (a as any).severity === 'warning').length,
        info: alerts.filter(a => (a as any).severity === 'info').length,
        averageResponseTime: 15, // Mock data
        falsePositiveRate: 5.2, // Mock data
        topTypes: [
          { type: 'consumption', count: 12 },
          { type: 'generation', count: 8 },
          { type: 'storage', count: 5 },
          { type: 'device_fault', count: 3 }
        ]
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching alert statistics:', error);
      res.status(500).json({ error: 'Failed to fetch alert statistics' });
    }
  });
  
  // Export alerts
  app.post("/api/alerts/export", async (req, res) => {
    try {
      const { format = 'csv', alertIds, filters } = req.body;
      
      let alerts;
      if (alertIds && alertIds.length > 0) {
        // Export specific alerts
        alerts = await getAlertsByIds(alertIds);
      } else {
        // Export all alerts with filters
        alerts = await storage.getActiveAlerts();
      }
      
      switch (format) {
        case 'csv':
          const csv = generateCSV(alerts);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=alerts.csv');
          res.send(csv);
          break;
          
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename=alerts.json');
          res.json(alerts);
          break;
          
        case 'pdf':
          // Would implement PDF generation
          res.status(501).json({ error: 'PDF export not implemented yet' });
          break;
          
        default:
          res.status(400).json({ error: 'Invalid export format' });
      }
    } catch (error) {
      console.error('Error exporting alerts:', error);
      res.status(500).json({ error: 'Failed to export alerts' });
    }
  });
  
  // Manual alert creation (for testing or manual reporting)
  app.post("/api/alerts/manual", async (req, res) => {
    try {
      const alertData = req.body;
      
      // Validate alert data
      const validatedAlert = validateManualAlert(alertData);
      
      // Create alert
      const alert = await storage.addAlert({
        title: validatedAlert.title,
        description: validatedAlert.description,
        type: validatedAlert.type,
      });
      
      // Send notifications
      await notificationService.sendAlertNotification(alert as any, ['dashboard', 'websocket']);
      
      res.json({ success: true, alert });
    } catch (error) {
      console.error('Error creating manual alert:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  });
  
  // Test alert detection engine
  app.post("/api/alerts/test-detection", async (req, res) => {
    try {
      const { simulationType = 'normal' } = req.body;
      
      // Get recent energy metrics
      const recentMetrics = await storage.getRecentEnergyMetrics(24);
      
      // Run alert detection
      const detectionResults = await alertDetectionEngine.detectAnomalies(recentMetrics);
      
      // Create alerts for any detections
      const createdAlerts = [];
      for (const result of detectionResults) {
        if (result.isAlert) {
          const alert = await storage.addAlert({
            title: `Test Alert: ${result.type}`,
            description: result.description,
            type: result.type,
          });
          
          // Send notifications
          await notificationService.sendAlertNotification(alert as any, ['dashboard', 'websocket']);
          
          createdAlerts.push(alert);
        }
      }
      
      res.json({
        success: true,
        detectionsCount: detectionResults.length,
        alertsCreated: createdAlerts.length,
        results: detectionResults
      });
    } catch (error) {
      console.error('Error testing alert detection:', error);
      res.status(500).json({ error: 'Failed to test alert detection' });
    }
  });
}

// Helper functions

async function getAlertInteractions(alertId: string): Promise<any[]> {
  // Mock interaction data - in real implementation, would fetch from database
  return [
    {
      id: '1',
      timestamp: new Date(),
      action: 'created',
      userId: 'system',
      description: 'Alert created by detection engine',
      type: 'system'
    }
  ];
}

async function updateAlertStatus(alertId: string, status: string, userId: string, notes?: string): Promise<void> {
  // Mock implementation - in real app, would update database
  console.log(`Alert ${alertId} status updated to ${status} by ${userId}`);
  if (notes) {
    console.log(`Notes: ${notes}`);
  }
}

async function recordAlertInteraction(alertId: string, userId: string, action: string, notes?: string): Promise<void> {
  // Mock implementation - in real app, would save to database
  console.log(`Alert interaction recorded: ${alertId} - ${action} by ${userId}`);
  if (notes) {
    console.log(`Notes: ${notes}`);
  }
}

async function getAlertsByIds(alertIds: string[]): Promise<any[]> {
  // Mock implementation - in real app, would fetch specific alerts
  const allAlerts = await storage.getActiveAlerts();
  return allAlerts.filter(alert => alertIds.includes(alert.id));
}

function generateCSV(alerts: any[]): string {
  const headers = ['ID', 'Title', 'Description', 'Type', 'Severity', 'Status', 'Timestamp'];
  const rows = alerts.map(alert => [
    alert.id,
    alert.title,
    alert.description,
    alert.type,
    (alert as any).severity || 'unknown',
    (alert as any).status || 'active',
    alert.timestamp.toISOString()
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
    
  return csvContent;
}

function validateManualAlert(alertData: any): any {
  const schema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    type: z.enum(['consumption', 'generation', 'storage', 'device_fault', 'system_health', 'anomaly']),
    severity: z.enum(['info', 'warning', 'critical']).optional().default('warning'),
    location: z.string().optional(),
    deviceId: z.string().optional()
  });
  
  return schema.parse(alertData);
}
