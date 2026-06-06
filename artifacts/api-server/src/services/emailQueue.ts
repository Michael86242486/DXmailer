import { db } from "@workspace/db";
import { emailLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { renderTemplate, type TemplateName } from "./templateEngine";
import { sendViaRotatingPool } from "./smtpService";

export interface QueuedEmail {
  logId: string;
  to: string;
  template: TemplateName;
  senderName: string;
  data: Record<string, unknown>;
  retryCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

// In-process queue — processes emails async without blocking the API response
const queue: QueuedEmail[] = [];
let isProcessing = false;

export function enqueue(job: QueuedEmail): void {
  queue.push(job);
  if (!isProcessing) {
    void processNext();
  }
}

async function processNext(): Promise<void> {
  if (queue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const job = queue.shift()!;

  logger.info(
    { logId: job.logId, to: job.to, template: job.template, retry: job.retryCount },
    "Processing queued email",
  );

  try {
    const { subject, html } = renderTemplate(job.template, job.data, job.senderName);

    await sendViaRotatingPool({
      to: job.to,
      subject,
      html,
      senderName: job.senderName,
    });

    // Mark as sent
    await db
      .update(emailLogsTable)
      .set({ status: "sent" })
      .where(eq(emailLogsTable.id, job.logId));

    logger.info({ logId: job.logId }, "Email marked as sent");
  } catch (err) {
    const error = err as Error;
    logger.error({ logId: job.logId, error: error.message, retry: job.retryCount }, "Email delivery failed");

    if (job.retryCount < MAX_RETRIES) {
      // Re-queue for retry after delay
      logger.info({ logId: job.logId, nextRetry: job.retryCount + 1 }, "Scheduling retry");
      setTimeout(() => {
        queue.unshift({ ...job, retryCount: job.retryCount + 1 });
        if (!isProcessing) {
          void processNext();
        }
      }, RETRY_DELAY_MS * Math.pow(2, job.retryCount));
    } else {
      // Max retries exhausted — mark as failed
      await db
        .update(emailLogsTable)
        .set({ status: "failed", errorMessage: error.message })
        .where(eq(emailLogsTable.id, job.logId));

      logger.error({ logId: job.logId }, "Email permanently failed after max retries");
    }
  }

  // Process the next item
  setTimeout(() => void processNext(), 100);
}
