import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateAIResponse, generateJournalPrompt } from "./openai";
import { 
  insertMoodSchema, 
  insertActivitySchema, 
  insertJournalEntrySchema,
  insertChatMessageSchema,
  insertExerciseSessionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User preferences
  app.post('/api/user/voice-preference', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { voice } = req.body;
      
      if (!voice || !['male', 'female'].includes(voice)) {
        return res.status(400).json({ message: "Invalid voice preference" });
      }

      await storage.updateUserVoicePreference(userId, voice);
      res.json({ message: "Voice preference updated" });
    } catch (error) {
      console.error("Error updating voice preference:", error);
      res.status(500).json({ message: "Failed to update voice preference" });
    }
  });

  // Mood tracking routes
  app.post('/api/moods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moodData = insertMoodSchema.parse({ ...req.body, userId });
      
      const mood = await storage.createMood(moodData);
      res.json(mood);
    } catch (error) {
      console.error("Error creating mood:", error);
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });

  app.get('/api/moods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const moods = await storage.getUserMoods(userId, limit);
      res.json(moods);
    } catch (error) {
      console.error("Error fetching moods:", error);
      res.status(500).json({ message: "Failed to fetch moods" });
    }
  });

  app.get('/api/moods/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getMoodStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching mood stats:", error);
      res.status(500).json({ message: "Failed to fetch mood statistics" });
    }
  });

  // Activity tracking routes
  app.post('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activityData = insertActivitySchema.parse({ ...req.body, userId });
      
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/activities/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activityId = parseInt(req.params.id);
      
      await storage.completeActivity(activityId, userId);
      res.json({ message: "Activity completed" });
    } catch (error) {
      console.error("Error completing activity:", error);
      res.status(500).json({ message: "Failed to complete activity" });
    }
  });

  app.get('/api/activities/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getActivityStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching activity stats:", error);
      res.status(500).json({ message: "Failed to fetch activity statistics" });
    }
  });

  // Journal routes
  app.post('/api/journal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertJournalEntrySchema.parse({ ...req.body, userId });
      
      const entry = await storage.createJournalEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.get('/api/journal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const entries = await storage.getUserJournalEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get('/api/journal/prompt', isAuthenticated, async (req: any, res) => {
    try {
      const prompt = await generateJournalPrompt();
      res.json({ prompt });
    } catch (error) {
      console.error("Error generating journal prompt:", error);
      res.status(500).json({ message: "Failed to generate journal prompt" });
    }
  });

  // AI Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Save user message
      await storage.createChatMessage(insertChatMessageSchema.parse({
        userId,
        message,
        isAI: false
      }));

      // Get user context
      const user = await storage.getUser(userId);
      const recentMoods = await storage.getUserMoods(userId, 5);
      
      // Generate AI response
      const aiResponse = await generateAIResponse(message, {
        recentMoods,
        userName: user?.firstName || undefined,
        preferredVoice: user?.preferredVoice || 'female'
      });

      // Save AI response
      await storage.createChatMessage(insertChatMessageSchema.parse({
        userId,
        message: aiResponse.message,
        isAI: true
      }));

      res.json(aiResponse);
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getUserChatHistory(userId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Exercise session routes
  app.post('/api/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertExerciseSessionSchema.parse({ ...req.body, userId });
      
      const session = await storage.createExerciseSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating exercise session:", error);
      res.status(500).json({ message: "Failed to create exercise session" });
    }
  });

  app.get('/api/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const sessions = await storage.getUserExerciseSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching exercise sessions:", error);
      res.status(500).json({ message: "Failed to fetch exercise sessions" });
    }
  });

  // Dashboard stats endpoint
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [moodStats, activityStats, exerciseSessions] = await Promise.all([
        storage.getMoodStats(userId),
        storage.getActivityStats(userId),
        storage.getUserExerciseSessions(userId, 30)
      ]);

      const stats = {
        dailyActivities: activityStats.completed,
        moodScore: Number(moodStats.average.toFixed(1)),
        exercisesCompleted: exerciseSessions.filter(s => s.completed).length,
        streak: activityStats.streak
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
