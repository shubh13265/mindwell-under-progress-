import {
  users,
  moods,
  activities,
  journalEntries,
  chatMessages,
  exerciseSessions,
  type User,
  type UpsertUser,
  type Mood,
  type InsertMood,
  type Activity,
  type InsertActivity,
  type JournalEntry,
  type InsertJournalEntry,
  type ChatMessage,
  type InsertChatMessage,
  type ExerciseSession,
  type InsertExerciseSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserVoicePreference(userId: string, voice: string): Promise<void>;
  
  // Mood operations
  createMood(mood: InsertMood): Promise<Mood>;
  getUserMoods(userId: string, limit?: number): Promise<Mood[]>;
  getMoodStats(userId: string, startDate?: Date, endDate?: Date): Promise<{ average: number; count: number }>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  completeActivity(activityId: number, userId: string): Promise<void>;
  getActivityStats(userId: string): Promise<{ completed: number; total: number; streak: number }>;
  
  // Journal operations
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getUserJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Exercise operations
  createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession>;
  getUserExerciseSessions(userId: string, limit?: number): Promise<ExerciseSession[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
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

  async updateUserVoicePreference(userId: string, voice: string): Promise<void> {
    await db
      .update(users)
      .set({ preferredVoice: voice, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Mood operations
  async createMood(mood: InsertMood): Promise<Mood> {
    const [newMood] = await db.insert(moods).values(mood).returning();
    return newMood;
  }

  async getUserMoods(userId: string, limit: number = 50): Promise<Mood[]> {
    return await db
      .select()
      .from(moods)
      .where(eq(moods.userId, userId))
      .orderBy(desc(moods.createdAt))
      .limit(limit);
  }

  async getMoodStats(userId: string, startDate?: Date, endDate?: Date): Promise<{ average: number; count: number }> {
    let query = db.select().from(moods).where(eq(moods.userId, userId));
    
    if (startDate) {
      query = query.where(and(eq(moods.userId, userId), gte(moods.createdAt, startDate)));
    }
    if (endDate) {
      query = query.where(and(eq(moods.userId, userId), lte(moods.createdAt, endDate)));
    }
    
    const userMoods = await query;
    const count = userMoods.length;
    const average = count > 0 ? userMoods.reduce((sum, mood) => sum + mood.moodValue, 0) / count : 0;
    
    return { average, count };
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getUserActivities(userId: string, limit: number = 50): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async completeActivity(activityId: number, userId: string): Promise<void> {
    await db
      .update(activities)
      .set({ completed: true })
      .where(and(eq(activities.id, activityId), eq(activities.userId, userId)));
  }

  async getActivityStats(userId: string): Promise<{ completed: number; total: number; streak: number }> {
    const userActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
    
    const total = userActivities.length;
    const completed = userActivities.filter(a => a.completed).length;
    
    // Calculate streak (simplified - consecutive days with completed activities)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const dayActivities = userActivities.filter(a => {
        const activityDate = new Date(a.createdAt!);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === checkDate.getTime() && a.completed;
      });
      
      if (dayActivities.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return { completed, total, streak };
  }

  // Journal operations
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  async getUserJournalEntries(userId: string, limit: number = 50): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getUserChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Exercise operations
  async createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession> {
    const [newSession] = await db.insert(exerciseSessions).values(session).returning();
    return newSession;
  }

  async getUserExerciseSessions(userId: string, limit: number = 50): Promise<ExerciseSession[]> {
    return await db
      .select()
      .from(exerciseSessions)
      .where(eq(exerciseSessions.userId, userId))
      .orderBy(desc(exerciseSessions.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
