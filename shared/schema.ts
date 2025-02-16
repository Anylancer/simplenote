import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  lastModified: timestamp("last_modified").notNull(),
});

export const insertNoteSchema = createInsertSchema(notes)
  .omit({ id: true, lastModified: true })
  .extend({
    title: z.string().min(1, "Title is required").max(100),
    content: z.string().min(1, "Content is required"),
  });

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
