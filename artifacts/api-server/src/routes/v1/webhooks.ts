import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { webhooksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomUUID, randomBytes } from "crypto";
import { requireApiKey } from "../../middlewares/auth";
import { z } from "zod";

const router: IRouter = Router();

const WebhookInputSchema = z.object({
  url: z.string().url(),
  events: z
    .array(z.enum(["email.sent", "email.failed", "email.queued"]))
    .min(1, "At least one event is required"),
});

// GET /v1/webhooks
router.get("/", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;

  const webhooks = await db
    .select()
    .from(webhooksTable)
    .where(eq(webhooksTable.developerId, developer.id));

  res.json({
    webhooks: webhooks.map((w) => ({
      id: w.id,
      developerId: w.developerId,
      url: w.url,
      events: JSON.parse(w.events) as string[],
      secret: w.secret,
      active: w.active,
      createdAt: w.createdAt,
    })),
  });
});

// POST /v1/webhooks
router.post("/", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;

  const parsed = WebhookInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url, events } = parsed.data;
  const id = randomUUID();
  const secret = `whsec_${randomBytes(24).toString("hex")}`;

  const [webhook] = await db
    .insert(webhooksTable)
    .values({
      id,
      developerId: developer.id,
      url,
      events: JSON.stringify(events),
      secret,
      active: true,
    })
    .returning();

  req.log.info({ webhookId: id, url, developerId: developer.id }, "Webhook registered");

  res.status(201).json({
    id: webhook!.id,
    developerId: webhook!.developerId,
    url: webhook!.url,
    events: JSON.parse(webhook!.events) as string[],
    secret: webhook!.secret,
    active: webhook!.active,
    createdAt: webhook!.createdAt,
  });
});

// DELETE /v1/webhooks/:id
router.delete("/:id", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [existing] = await db
    .select()
    .from(webhooksTable)
    .where(and(eq(webhooksTable.id, id), eq(webhooksTable.developerId, developer.id)))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Webhook not found" });
    return;
  }

  await db
    .delete(webhooksTable)
    .where(and(eq(webhooksTable.id, id), eq(webhooksTable.developerId, developer.id)));

  req.log.info({ webhookId: id, developerId: developer.id }, "Webhook deleted");
  res.sendStatus(204);
});

// POST /v1/webhooks/:id/test
router.post("/:id/test", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [webhook] = await db
    .select()
    .from(webhooksTable)
    .where(and(eq(webhooksTable.id, id), eq(webhooksTable.developerId, developer.id)))
    .limit(1);

  if (!webhook) {
    res.status(404).json({ error: "Webhook not found" });
    return;
  }

  // Fire test payload asynchronously
  const testPayload = JSON.stringify({
    event: "email.sent",
    timestamp: new Date().toISOString(),
    data: {
      messageId: "test-" + randomUUID(),
      recipient: "test@example.com",
      template: "verification",
      note: "This is a test event from ORACLEX",
    },
  });

  void (async () => {
    try {
      const { createHmac } = await import("crypto");
      const hmac = createHmac("sha256", webhook.secret);
      hmac.update(testPayload);
      const signature = `sha256=${hmac.digest("hex")}`;

      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ORACLEX-Signature": signature,
          "X-ORACLEX-Event": "email.sent",
        },
        body: testPayload,
        signal: AbortSignal.timeout(10_000),
      });

      req.log.info({ webhookId: id }, "Test webhook dispatched successfully");
    } catch (err) {
      req.log.warn({ webhookId: id, err }, "Test webhook delivery failed");
    }
  })();

  res.json({ dispatched: true, message: "Test event dispatched to " + webhook.url });
});

export default router;
