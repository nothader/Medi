import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  purpose: text("purpose"),
  active: boolean("active").default(true),
  effects: text("effects"),
  sideEffects: text("side_effects"),
  category: text("category"),
  description: text("description"),
});

export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  note: text("note"),
  timestamp: timestamp("timestamp").defaultNow(),
  relatedMedications: text("related_medications").array(),
  analysis: text("analysis"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMedicationSchema = createInsertSchema(medications).pick({
  name: true,
  dosage: true,
  frequency: true,
  purpose: true,
  effects: true,
  sideEffects: true,
  category: true,
  description: true,
});

export const insertMoodSchema = createInsertSchema(moods).pick({
  rating: true,
  note: true,
  relatedMedications: true,
  analysis: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type Mood = typeof moods.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type InsertMood = z.infer<typeof insertMoodSchema>;