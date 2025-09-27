import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Energy metrics table for time-series data
export const energyMetrics = pgTable("energy_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  consumption: real("consumption").notNull(), // kW
  generation: real("generation").notNull(), // kW
  storage: real("storage").notNull(), // percentage
  gridExport: real("grid_export").notNull(), // kW
  solarEfficiency: real("solar_efficiency").notNull(), // percentage
  batteryHealth: real("battery_health").notNull(), // percentage
});

// Anomaly detection results
export const anomalies = pgTable("anomalies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  type: text("type").notNull(), // consumption, generation, storage, device_fault
  severity: text("severity").notNull(), // low, medium, high, critical
  score: real("score").notNull(), // 0-1 anomaly confidence score
  description: text("description").notNull(),
  affectedComponent: text("affected_component"), // zone, device, system
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
});

// Alert management
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // info, warning, critical, success, anomaly
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  dismissed: boolean("dismissed").notNull().default(false),
  dismissedAt: timestamp("dismissed_at"),
  anomalyId: varchar("anomaly_id").references(() => anomalies.id),
});

// Daily reports
export const dailyReports = pgTable("daily_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalConsumption: real("total_consumption").notNull(), // kWh
  totalGeneration: real("total_generation").notNull(), // kWh
  co2Saved: real("co2_saved").notNull(), // kg
  costSavings: real("cost_savings").notNull(), // currency
  efficiencyScore: real("efficiency_score").notNull(), // 0-100
  anomaliesDetected: integer("anomalies_detected").notNull(),
});

// Schema validation
export const insertEnergyMetricSchema = createInsertSchema(energyMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertAnomalySchema = createInsertSchema(anomalies).omit({
  id: true,
  timestamp: true,
  resolved: true,
  resolvedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
  dismissed: true,
  dismissedAt: true,
});

export const insertDailyReportSchema = createInsertSchema(dailyReports).omit({
  id: true,
});

// Types
export type EnergyMetric = typeof energyMetrics.$inferSelect;
export type InsertEnergyMetric = z.infer<typeof insertEnergyMetricSchema>;

export type Anomaly = typeof anomalies.$inferSelect;
export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type DailyReport = typeof dailyReports.$inferSelect;
export type InsertDailyReport = z.infer<typeof insertDailyReportSchema>;

// Legacy user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
