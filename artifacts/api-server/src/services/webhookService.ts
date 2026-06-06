import { db } from "@workspace/db";
import { webhooksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { createHmac } from "crypto";
import { logger } from "../lib/logger";

export interface WebhookPayload {
  event: "email.sent" | "email.failed" | "email.queued";
  timestamp: string;
  data: Record<string, unknown>;
}

async function signPayload(secret: string, body: string): Promise<string> {
  const hmac = createHmac("sha256", secret);
  hmac.update(body);
  return `sha256=${hmac.digest("hex")}`;
}

export async function dispatchWebhooks(
  developerId: string,
  event: WebhookPayload["event"],
  data: Record<string, unknown>,
): Promise<void> {
  let endpoints: typeof webhooksTable.$inferSelect[] = [];

  try {
    endpoints = await db
      .select()
      .from(webhooksTable)
      .where(and(eq(webhooksTable.developerId, developerId), eq(webhooksTable.active, true)));
  } catch (err) {
    logger.error({ err, developerId, event }, "Failed to fetch webhooks for dispatch");
    return;
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);

  for (const endpoint of endpoints) {
    let events: string[] = [];
    try {
      events = JSON.parse(endpoint.events) as string[];
    } catch {
      continue;
    }

    if (!events.includes(event)) continue;

    void (async () => {
      try {
        const signature = await signPayload(endpoint.secret, body);
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-ORACLEX-Signature": signature,
            "X-ORACLEX-Event": event,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        });

        logger.info(
          { webhookId: endpoint.id, url: endpoint.url, event, status: response.status },
          "Webhook dispatched",
        );
      } catch (err) {
        logger.warn(
          { webhookId: endpoint.id, url: endpoint.url, event, err },
          "Webhook delivery failed",
        );
      }
    })();
  }
}
