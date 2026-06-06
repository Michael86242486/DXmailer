import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emailLogStatusEnum = ["queued", "sent", "failed"] as const;
export type EmailLogStatus = (typeof emailLogStatusEnum)[number];

export const emailLogsTable = pgTable("email_logs", {
  id: text("id").primaryKey(),
  developerId: text("developer_id").notNull(),
  recipient: text("recipient").notNull(),
  templateUsed: text("template_used").notNull(),
  status: text("status").$type<EmailLogStatus>().notNull().default("queued"),
  errorMessage: text("error_message"),
  senderName: text("sender_name").notNull().default(""),
  templateData: text("template_data").notNull().default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEmailLogSchema = createInsertSchema(emailLogsTable).omit({ createdAt: true });
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogsTable.$inferSelect;
