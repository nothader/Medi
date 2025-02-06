import { 
  User, 
  Medication, 
  Mood,
  InsertUser,
  InsertMedication,
  InsertMood 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Medication operations
  getMedicationsForUser(userId: number): Medication[];
  getMedication(userId: number, medicationId: number): Medication | undefined;
  createMedication(userId: number, medication: InsertMedication): Promise<Medication>;
  updateMedication(userId: number, medicationId: number, medication: Partial<InsertMedication>): Promise<Medication>;
  deleteMedication(userId: number, medicationId: number): Promise<void>;

  // Mood operations
  getMoodsForUser(userId: number): Mood[];
  createMood(userId: number, mood: InsertMood): Promise<Mood>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medications: Map<number, Medication>;
  private moods: Map<number, Mood>;
  readonly sessionStore: session.SessionStore;

  private userIdCounter: number;
  private medicationIdCounter: number;
  private moodIdCounter: number;

  constructor() {
    this.users = new Map();
    this.medications = new Map();
    this.moods = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    this.userIdCounter = 1;
    this.medicationIdCounter = 1;
    this.moodIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Medication operations
  getMedicationsForUser(userId: number): Medication[] {
    return Array.from(this.medications.values()).filter(
      (med) => med.userId === userId
    ).sort((a, b) => b.id - a.id); // Sort by newest first
  }

  getMedication(userId: number, medicationId: number): Medication | undefined {
    const medication = this.medications.get(medicationId);
    if (medication && medication.userId === userId) {
      return medication;
    }
    return undefined;
  }

  async createMedication(userId: number, medication: InsertMedication): Promise<Medication> {
    const id = this.medicationIdCounter++;
    const newMedication: Medication = {
      ...medication,
      id,
      userId,
      active: true
    };
    this.medications.set(id, newMedication);
    return newMedication;
  }

  async updateMedication(
    userId: number,
    medicationId: number,
    updates: Partial<InsertMedication>
  ): Promise<Medication> {
    const existing = this.getMedication(userId, medicationId);
    if (!existing) {
      throw new Error("Medication not found");
    }

    const updated: Medication = {
      ...existing,
      ...updates,
    };
    this.medications.set(medicationId, updated);
    return updated;
  }

  async deleteMedication(userId: number, medicationId: number): Promise<void> {
    const existing = this.getMedication(userId, medicationId);
    if (!existing) {
      throw new Error("Medication not found");
    }
    
    // Soft delete by marking as inactive
    this.medications.set(medicationId, {
      ...existing,
      active: false
    });
  }

  // Mood operations
  getMoodsForUser(userId: number): Mood[] {
    return Array.from(this.moods.values())
      .filter((mood) => mood.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createMood(userId: number, mood: InsertMood): Promise<Mood> {
    const id = this.moodIdCounter++;
    const newMood: Mood = {
      ...mood,
      id,
      userId,
      timestamp: new Date()
    };
    this.moods.set(id, newMood);
    return newMood;
  }
}

// Export a singleton instance
export const storage = new MemStorage();
