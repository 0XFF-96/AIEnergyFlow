import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Extended Alert System Schema for Smart Microgrid Dashboard

// Alert severity levels and types
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'consumption' | 'generation' | 'storage' | 'device_fault' | 'system_health' | 'anomaly';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

// Enhanced alerts table with full alert system support
export const alertSystem = pgTable("alert_system", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // consumption, generation, storage, device_fault, system_health, anomaly
  severity: text("severity").notNull(), // info, warning, critical
  status: text("status").notNull().default('active'), // active, acknowledged, resolved, dismissed
  source: text("source").notNull(), // sensor, ai_detection, manual, system
  deviceId: varchar("device_id"), // Reference to specific device/component
  location: text("location"), // Zone or area affected
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: varchar("acknowledged_by"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  resolutionNotes: text("resolution_notes"),
  metadata: jsonb("metadata"), // Additional data like sensor readings, AI confidence scores
  anomalyId: varchar("anomaly_id"), // Reference to anomaly if AI-generated
});

// Alert notifications tracking
export const alertNotifications = pgTable("alert_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertId: varchar("alert_id").notNull().references(() => alertSystem.id),
  channel: text("channel").notNull(), // dashboard, email, sms, push, websocket
  status: text("status").notNull(), // pending, sent, delivered, failed
  recipient: text("recipient").notNull(), // email, phone, user_id
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
});

// Alert escalation rules
export const alertEscalationRules = pgTable("alert_escalation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  severity: text("severity").notNull(),
  type: text("type").notNull(),
  escalationDelay: integer("escalation_delay").notNull(), // minutes
  escalationChannels: jsonb("escalation_channels").notNull(), // ["email", "sms", "manager"]
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Alert user interactions and feedback
export const alertInteractions = pgTable("alert_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertId: varchar("alert_id").notNull().references(() => alertSystem.id),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(), // view, acknowledge, resolve, dismiss, escalate
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional interaction data
});

// Alert statistics and reporting
export const alertStatistics = pgTable("alert_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalAlerts: integer("total_alerts").notNull(),
  activeAlerts: integer("active_alerts").notNull(),
  resolvedAlerts: integer("resolved_alerts").notNull(),
  criticalAlerts: integer("critical_alerts").notNull(),
  averageResponseTime: integer("average_response_time"), // minutes
  falsePositiveRate: real("false_positive_rate"), // percentage
  userEngagementRate: real("user_engagement_rate"), // percentage
  metadata: jsonb("metadata"), // Additional statistics
});

// Sensor data for alert detection
export const sensorData = pgTable("sensor_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sensorId: text("sensor_id").notNull(),
  deviceId: text("device_id").notNull(),
  location: text("location").notNull(),
  sensorType: text("sensor_type").notNull(), // consumption, generation, storage, efficiency, health
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  quality: text("quality").notNull().default('good'), // good, degraded, poor, unknown
  metadata: jsonb("metadata"), // Additional sensor metadata
});

// Alert detection rules
export const alertRules = pgTable("alert_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // threshold, pattern, ai, statistical
  severity: text("severity").notNull(),
  conditions: jsonb("conditions").notNull(), // Rule conditions
  actions: jsonb("actions").notNull(), // Actions to take
  enabled: boolean("enabled").notNull().default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schema validation
export const insertAlertSystemSchema = createInsertSchema(alertSystem).omit({
  id: true,
  timestamp: true,
  status: true,
  acknowledgedAt: true,
  resolvedAt: true,
});

export const insertAlertNotificationSchema = createInsertSchema(alertNotifications).omit({
  id: true,
  sentAt: true,
  deliveredAt: true,
  retryCount: true,
});

export const insertAlertInteractionSchema = createInsertSchema(alertInteractions).omit({
  id: true,
  timestamp: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
  timestamp: true,
});

export const insertAlertRuleSchema = createInsertSchema(alertRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type AlertSystem = typeof alertSystem.$inferSelect;
export type InsertAlertSystem = z.infer<typeof insertAlertSystemSchema>;

export type AlertNotification = typeof alertNotifications.$inferSelect;
export type InsertAlertNotification = z.infer<typeof insertAlertNotificationSchema>;

export type AlertInteraction = typeof alertInteractions.$inferSelect;
export type InsertAlertInteraction = z.infer<typeof insertAlertInteractionSchema>;

export type SensorData = typeof sensorData.$inferSelect;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;

export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;

export type AlertStatistics = typeof alertStatistics.$inferSelect;
const insertAlertStatisticsSchema = createInsertSchema(alertStatistics).omit({
  id: true,
});

export type InsertAlertStatistics = z.infer<typeof insertAlertStatisticsSchema>;

// Alert system interfaces
export interface AlertDetectionResult {
  isAlert: boolean;
  severity: AlertSeverity;
  type: AlertType;
  confidence: number;
  description: string;
  affectedComponent?: string;
  metadata?: Record<string, any>;
}

export interface NotificationChannel {
  type: 'dashboard' | 'email' | 'sms' | 'push' | 'websocket';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AlertEscalationConfig {
  severity: AlertSeverity;
  delay: number; // minutes
  channels: string[];
  recipients: string[];
}
