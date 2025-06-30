import {
  users,
  weatherData,
  aiPredictions,
  chatMessages,
  weatherAlerts,
  mlModelStatus,
  type User,
  type UpsertUser,
  type WeatherData,
  type InsertWeatherData,
  type AiPrediction,
  type InsertAiPrediction,
  type ChatMessage,
  type InsertChatMessage,
  type WeatherAlert,
  type InsertWeatherAlert,
  type MlModelStatus,
  type InsertMlModelStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Weather data operations
  insertWeatherData(data: InsertWeatherData): Promise<WeatherData>;
  getWeatherDataByRegion(lat: number, lon: number, radius: number): Promise<WeatherData[]>;
  getLatestWeatherData(limit?: number): Promise<WeatherData[]>;
  
  // AI predictions operations
  insertAiPrediction(prediction: InsertAiPrediction): Promise<AiPrediction>;
  getAiPredictionsByType(type: string, limit?: number): Promise<AiPrediction[]>;
  
  // Chat operations
  insertChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Weather alerts operations
  insertWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert>;
  getActiveWeatherAlerts(): Promise<WeatherAlert[]>;
  
  // ML model status operations
  upsertMlModelStatus(status: InsertMlModelStatus): Promise<MlModelStatus>;
  getAllMlModelStatus(): Promise<MlModelStatus[]>;
  getMlModelStatus(modelName: string): Promise<MlModelStatus | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Weather data operations
  async insertWeatherData(data: InsertWeatherData): Promise<WeatherData> {
    const [result] = await db.insert(weatherData).values(data).returning();
    return result;
  }

  async getWeatherDataByRegion(lat: number, lon: number, radius: number): Promise<WeatherData[]> {
    return await db
      .select()
      .from(weatherData)
      .where(
        and(
          gte(weatherData.latitude, lat - radius),
          lte(weatherData.latitude, lat + radius),
          gte(weatherData.longitude, lon - radius),
          lte(weatherData.longitude, lon + radius)
        )
      )
      .orderBy(desc(weatherData.timestamp))
      .limit(100);
  }

  async getLatestWeatherData(limit = 50): Promise<WeatherData[]> {
    return await db
      .select()
      .from(weatherData)
      .orderBy(desc(weatherData.timestamp))
      .limit(limit);
  }

  // AI predictions operations
  async insertAiPrediction(prediction: InsertAiPrediction): Promise<AiPrediction> {
    const [result] = await db.insert(aiPredictions).values(prediction).returning();
    return result;
  }

  async getAiPredictionsByType(type: string, limit = 50): Promise<AiPrediction[]> {
    return await db
      .select()
      .from(aiPredictions)
      .where(eq(aiPredictions.predictionType, type))
      .orderBy(desc(aiPredictions.timestamp))
      .limit(limit);
  }

  // Chat operations
  async insertChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [result] = await db.insert(chatMessages).values(message).returning();
    return result;
  }

  async getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  // Weather alerts operations
  async insertWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert> {
    const [result] = await db.insert(weatherAlerts).values(alert).returning();
    return result;
  }

  async getActiveWeatherAlerts(): Promise<WeatherAlert[]> {
    return await db
      .select()
      .from(weatherAlerts)
      .where(eq(weatherAlerts.isActive, true))
      .orderBy(desc(weatherAlerts.createdAt));
  }

  // ML model status operations
  async upsertMlModelStatus(status: InsertMlModelStatus): Promise<MlModelStatus> {
    const [result] = await db
      .insert(mlModelStatus)
      .values(status)
      .onConflictDoUpdate({
        target: mlModelStatus.modelName,
        set: {
          ...status,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getAllMlModelStatus(): Promise<MlModelStatus[]> {
    return await db.select().from(mlModelStatus).orderBy(mlModelStatus.modelName);
  }

  async getMlModelStatus(modelName: string): Promise<MlModelStatus | undefined> {
    const [result] = await db
      .select()
      .from(mlModelStatus)
      .where(eq(mlModelStatus.modelName, modelName));
    return result;
  }
}

export const storage = new DatabaseStorage();
