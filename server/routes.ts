import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertNoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/notes", async (_req, res) => {
    const notes = await storage.getNotes();
    res.json(notes);
  });

  app.get("/api/notes/:id", async (req, res) => {
    const note = await storage.getNote(Number(req.params.id));
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.json(note);
  });

  app.post("/api/notes", async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.message });
      return;
    }

    const note = await storage.createNote(result.data);
    res.status(201).json(note);
  });

  app.patch("/api/notes/:id", async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.message });
      return;
    }

    try {
      const note = await storage.updateNote(Number(req.params.id), result.data);
      res.json(note);
    } catch (error) {
      res.status(404).json({ message: "Note not found" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Note not found" });
    }
  });

  return createServer(app);
}
