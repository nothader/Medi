import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMedicationSchema, insertMoodSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Medications routes
  app.get("/api/medications", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(storage.getMedicationsForUser(req.user.id));
  });

  app.post("/api/medications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsed = insertMedicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const medication = await storage.createMedication(req.user.id, parsed.data);
    res.status(201).json(medication);
  });

  app.delete("/api/medications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.sendStatus(400);

    await storage.deleteMedication(req.user.id, id);
    res.sendStatus(200);
  });

  // Moods routes
  app.get("/api/moods", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(storage.getMoodsForUser(req.user.id));
  });

  app.post("/api/moods", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsed = insertMoodSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const mood = await storage.createMood(req.user.id, parsed.data);
    res.status(201).json(mood);
  });

  const httpServer = createServer(app);
  return httpServer;
}
