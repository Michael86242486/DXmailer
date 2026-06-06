import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const webhookEventEnum = ["email.sent", "email.failed", "email.queued"] as const;
export type WebhookEvent = (typeof webhookEventEnum)[number];

export const webhooksTable = pgTable("webhooks", {
  id: text("id").primaryKey(),
  developerId: text("developer_id").notNull(),
  url: text("url").notNull(),
  events: text("events").notNull().default("[]"), // JSON array of WebhookEvent
  secret: text("secret").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWebhookSchema = createInsertSchema(webhooksTable).omit({ createdAt: true });
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooksTable.$inferSelect;
