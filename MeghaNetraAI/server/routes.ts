import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import session from "express-session";
import { storage } from "./storage";

// Extend session type
declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      email: string;
      firstName: string;
      profileImageUrl: string;
    };
  }
}
// import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./services/aiService";
import { weatherService } from "./services/weatherService";
import { mlService } from "./services/mlService";
import { insertChatMessageSchema } from "@shared/schema";

// Simple authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  // For demo purposes, just check if user session exists
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session setup
  app.use(session({
    secret: 'megha-netra-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

  // Simple login route
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Simple validation (in production, use proper authentication)
    if (email && password) {
      req.session.user = {
        id: 'demo-user-123',
        email: email,
        firstName: email.split('@')[0],
        profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(400).json({ message: "Email and password required" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // User info route
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    res.json(req.session.user);
  });

  // Chat routes
  app.post('/api/chat/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const { message } = insertChatMessageSchema.parse(req.body);
      
      const startTime = Date.now();
      
      // Get weather context for AI
      const weatherContext = await weatherService.analyzeWeatherPatterns();
      
      // Process message with AI
      const aiResponse = await aiService.processWeatherQuery(message, weatherContext);
      const responseTime = Date.now() - startTime;
      
      // Store chat message and response
      const chatMessage = await storage.insertChatMessage({
        userId,
        message,
        response: aiResponse,
        modelUsed: 'gpt-4-turbo-preview',
        responseTime
      });
      
      res.json({
        message: chatMessage,
        response: aiResponse,
        responseTime,
        modelUsed: 'MeghaNetra AI'
      });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const history = await storage.getChatHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Weather routes
  app.get('/api/weather/current', isAuthenticated, async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude required" });
      }
      
      const weather = await weatherService.getCurrentWeather(
        parseFloat(lat as string),
        parseFloat(lon as string)
      );
      
      res.json(weather);
    } catch (error) {
      console.error("Current weather error:", error);
      res.status(500).json({ message: "Failed to fetch current weather" });
    }
  });

  app.get('/api/weather/forecast', isAuthenticated, async (req, res) => {
    try {
      const { lat, lon, days } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude required" });
      }
      
      const forecast = await weatherService.getWeatherForecast(
        parseFloat(lat as string),
        parseFloat(lon as string),
        parseInt(days as string) || 5
      );
      
      res.json(forecast);
    } catch (error) {
      console.error("Weather forecast error:", error);
      res.status(500).json({ message: "Failed to fetch weather forecast" });
    }
  });

  app.get('/api/weather/alerts', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getActiveWeatherAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Weather alerts error:", error);
      res.status(500).json({ message: "Failed to fetch weather alerts" });
    }
  });

  app.get('/api/weather/patterns', isAuthenticated, async (req, res) => {
    try {
      const patterns = await weatherService.analyzeWeatherPatterns();
      res.json(patterns);
    } catch (error) {
      console.error("Weather patterns error:", error);
      res.status(500).json({ message: "Failed to analyze weather patterns" });
    }
  });

  // ML routes
  app.post('/api/ml/predict', isAuthenticated, async (req, res) => {
    try {
      const { inputData } = req.body;
      
      if (!inputData) {
        return res.status(400).json({ message: "Input data required" });
      }
      
      const prediction = await mlService.predictWeatherPattern(inputData);
      res.json(prediction);
    } catch (error) {
      console.error("ML prediction error:", error);
      res.status(500).json({ message: "Failed to generate prediction" });
    }
  });

  app.post('/api/ml/analyze-satellite', isAuthenticated, async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data required" });
      }
      
      const analysis = await mlService.analyzeSatelliteImage(imageData);
      res.json(analysis);
    } catch (error) {
      console.error("Satellite analysis error:", error);
      res.status(500).json({ message: "Failed to analyze satellite image" });
    }
  });

  app.get('/api/ml/models', isAuthenticated, async (req, res) => {
    try {
      const models = await storage.getAllMlModelStatus();
      res.json(models);
    } catch (error) {
      console.error("ML models error:", error);
      res.status(500).json({ message: "Failed to fetch ML models" });
    }
  });

  app.get('/api/ml/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await mlService.getModelMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("ML metrics error:", error);
      res.status(500).json({ message: "Failed to fetch ML metrics" });
    }
  });

  app.post('/api/ml/train', isAuthenticated, async (req, res) => {
    try {
      const { modelName, trainingData } = req.body;
      
      if (!modelName) {
        return res.status(400).json({ message: "Model name is required" });
      }
      
      const result = await mlService.trainModel(modelName, trainingData || {});
      res.json(result);
    } catch (error) {
      console.error("ML training error:", error);
      res.status(500).json({ message: "Failed to initiate model training" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/dashboard', isAuthenticated, async (req, res) => {
    try {
      const [alerts, patterns, metrics] = await Promise.all([
        storage.getActiveWeatherAlerts(),
        weatherService.analyzeWeatherPatterns(),
        mlService.getModelMetrics()
      ]);
      
      res.json({
        activeAlerts: alerts.length,
        weatherPatterns: patterns,
        mlMetrics: metrics,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error("Dashboard analytics error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    
    // Send initial status
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      timestamp: new Date().toISOString()
    }));

    // Send periodic updates
    const updateInterval = setInterval(async () => {
      try {
        const metrics = await mlService.getModelMetrics();
        const patterns = await weatherService.analyzeWeatherPatterns();
        
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'update',
            data: {
              mlMetrics: metrics,
              weatherPatterns: patterns,
              timestamp: new Date().toISOString()
            }
          }));
        }
      } catch (error) {
        console.error('WebSocket update error:', error);
      }
    }, 30000); // Update every 30 seconds

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clearInterval(updateInterval);
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
