import { pgTable, text, integer, serial, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const smtpPoolStatusEnum = ["active", "locked", "rate_limited"] as const;
export type SmtpPoolStatus = (typeof smtpPoolStatusEnum)[number];

export const smtpPoolTable = pgTable("smtp_pool", {
  id: serial("id").primaryKey(),
  gmailUsername: text("gmail_username").notNull().unique(),
  appPassword: text("app_password").notNull(),
  dailySentCount: integer("daily_sent_count").notNull().default(0),
  maxDailyLimit: integer("max_daily_limit").notNull().default(500),
  lastUsedTimestamp: bigint("last_used_timestamp", { mode: "number" }).notNull().default(0),
  status: text("status").$type<SmtpPoolStatus>().notNull().default("active"),
});

export const insertSmtpPoolSchema = createInsertSchema(smtpPoolTable).omit({ id: true });
export type InsertSmtpPool = z.infer<typeof insertSmtpPoolSchema>;
export type SmtpPool = typeof smtpPoolTable.$inferSelect;
