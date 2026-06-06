import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const developersTable = pgTable("developers", {
  id: text("id").primaryKey(),
  apiKey: text("api_key").notNull().unique(),
  companyName: text("company_name").notNull(),
  rateLimitPerMin: integer("rate_limit_per_min").notNull().default(60),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeveloperSchema = createInsertSchema(developersTable).omit({ createdAt: true });
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;
export type Developer = typeof developersTable.$inferSelect;
