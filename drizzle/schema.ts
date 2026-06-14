import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Medical reports table for storing uploaded or manually entered medical data
 */
export const medicalReports = mysqlTable("medical_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportType: mysqlEnum("reportType", ["uploaded", "manual"]).notNull(),
  fileUrl: text("fileUrl"), // S3 URL if uploaded
  fileKey: text("fileKey"), // S3 key if uploaded
  extractedText: text("extractedText"), // OCR extracted text
  rawData: json("rawData"), // Raw input data for manual entries
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MedicalReport = typeof medicalReports.$inferSelect;
export type InsertMedicalReport = typeof medicalReports.$inferInsert;

/**
 * Analysis results table for storing disease predictions and diagnostics
 */
export const analysisResults = mysqlTable("analysis_results", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull().references(() => medicalReports.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  riskLevel: mysqlEnum("riskLevel", ["low", "moderate", "high", "very_high"]).notNull(),
  confidencePercentage: decimal("confidencePercentage", { precision: 5, scale: 2 }).notNull(),
  detectedEntities: json("detectedEntities"), // Symptoms, medicines, metrics
  diagnosticSummary: text("diagnosticSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = typeof analysisResults.$inferInsert;