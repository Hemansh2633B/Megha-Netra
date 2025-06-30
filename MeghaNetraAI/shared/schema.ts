import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  real,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weather data table
export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  temperature: real("temperature"),
  humidity: real("humidity"),
  pressure: real("pressure"),
  windSpeed: real("wind_speed"),
  windDirection: real("wind_direction"),
  weatherType: varchar("weather_type"),
  confidence: real("confidence"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// AI predictions table
export const aiPredictions = pgTable("ai_predictions", {
  id: serial("id").primaryKey(),
  modelName: varchar("model_name").notNull(),
  inputData: jsonb("input_data").notNull(),
  prediction: jsonb("prediction").notNull(),
  confidence: real("confidence").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  predictionType: varchar("prediction_type").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  message: text("message").notNull(),
  response: text("response"),
  modelUsed: varchar("model_used"),
  responseTime: integer("response_time"), // in milliseconds
  timestamp: timestamp("timestamp").defaultNow(),
});

// Weather alerts table
export const weatherAlerts = pgTable("weather_alerts", {
  id: serial("id").primaryKey(),
  alertType: varchar("alert_type").notNull(),
  severity: varchar("severity").notNull(),
  region: varchar("region").notNull(),
  description: text("description").notNull(),
  confidence: real("confidence").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ML model status table
export const mlModelStatus = pgTable("ml_model_status", {
  id: serial("id").primaryKey(),
  modelName: varchar("model_name").notNull().unique(),
  modelType: varchar("model_type").notNull(), // LSTM, CNN, Transformer
  status: varchar("status").notNull(), // active, training, offline
  accuracy: real("accuracy"),
  lastTrained: timestamp("last_trained"),
  version: varchar("version"),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertWeatherData = typeof weatherData.$inferInsert;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertAiPrediction = typeof aiPredictions.$inferInsert;
export type AiPrediction = typeof aiPredictions.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertWeatherAlert = typeof weatherAlerts.$inferInsert;
export type WeatherAlert = typeof weatherAlerts.$inferSelect;
export type InsertMlModelStatus = typeof mlModelStatus.$inferInsert;
export type MlModelStatus = typeof mlModelStatus.$inferSelect;

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  message: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  timestamp: true,
});
