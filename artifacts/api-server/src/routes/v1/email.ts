import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { emailLogsTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { requireApiKey } from "../../middlewares/auth";
import { enqueue } from "../../services/emailQueue";
import type { TemplateName } from "../../services/templateEngine";
import { z } from "zod";

const router: IRouter = Router();

const SendEmailBodySchema = z.object({
  to: z.string().email(),
  template: z.enum(["verification", "otp", "password-reset", "magic-link", "security-alert", "welcome-email"]),
  senderName: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional().default({}),
});

const ListLogsQuerySchema = z.object({
  status: z.enum(["queued", "sent", "failed"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// POST /v1/email/send
router.post("/send", requireApiKey, async (req, res): Promise<void> => {
  const parsed = SendEmailBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { to, template, senderName, data } = parsed.data;
  const developer = req.developer!;
  const messageId = randomUUID();

  // Write queued log — never send synchronously
  await db.insert(emailLogsTable).values({
    id: messageId,
    developerId: developer.id,
    recipient: to,
    templateUsed: template,
    status: "queued" as const,
    senderName,
    templateData: JSON.stringify(data),
  } as typeof emailLogsTable.$inferInsert);

  req.log.info({ messageId, to, template, developerId: developer.id }, "Email queued");

  // Push to async queue — do NOT await, returns immediately (HTTP 202)
  enqueue({
    logId: messageId,
    to,
    template: template as TemplateName,
    senderName,
    data: data as Record<string, unknown>,
    retryCount: 0,
  });

  res.status(202).json({ messageId, status: "queued" });
});

// GET /v1/email/logs
router.get("/logs", requireApiKey, async (req, res): Promise<void> => {
  const parsed = ListLogsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, limit, offset } = parsed.data;
  const developer = req.developer!;

  const baseWhere = eq(emailLogsTable.developerId, developer.id);
  const where = status ? and(baseWhere, eq(emailLogsTable.status, status)) : baseWhere;

  const [logs, totals] = await Promise.all([
    db
      .select()
      .from(emailLogsTable)
      .where(where)
      .orderBy(desc(emailLogsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(emailLogsTable).where(where),
  ]);

  res.json({
    logs: logs.map((l) => ({
      id: l.id,
      developerId: l.developerId,
      recipient: l.recipient,
      templateUsed: l.templateUsed,
      status: l.status,
      errorMessage: l.errorMessage ?? null,
      createdAt: l.createdAt,
    })),
    total: Number(totals[0]?.value ?? 0),
    limit,
    offset,
  });
});

// GET /v1/email/logs/:id
router.get("/logs/:id", requireApiKey, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const developer = req.developer!;

  const [log] = await db
    .select()
    .from(emailLogsTable)
    .where(and(eq(emailLogsTable.id, id), eq(emailLogsTable.developerId, developer.id)))
    .limit(1);

  if (!log) {
    res.status(404).json({ error: "Email log not found" });
    return;
  }

  res.json({
    id: log.id,
    developerId: log.developerId,
    recipient: log.recipient,
    templateUsed: log.templateUsed,
    status: log.status,
    errorMessage: log.errorMessage ?? null,
    createdAt: log.createdAt,
  });
});

export default router;
