import nodemailer from "nodemailer";
import { db } from "@workspace/db";
import { smtpPoolTable } from "@workspace/db";
import { eq, and, lt, asc } from "drizzle-orm";
import { logger } from "../lib/logger";

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  senderName: string;
}

export async function sendViaRotatingPool(opts: SendMailOptions): Promise<void> {
  // Atomic selection: most optimal active node (lowest last_used, has capacity)
  const [node] = await db
    .select()
    .from(smtpPoolTable)
    .where(
      and(
        eq(smtpPoolTable.status, "active"),
        lt(smtpPoolTable.dailySentCount, smtpPoolTable.maxDailyLimit),
      ),
    )
    .orderBy(asc(smtpPoolTable.lastUsedTimestamp))
    .limit(1);

  if (!node) {
    throw new Error("SMTP_CAPACITY_EXHAUSTED: No active Gmail nodes with remaining capacity");
  }

  logger.info({ nodeId: node.id, username: node.gmailUsername }, "Selected SMTP node");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: node.gmailUsername,
      pass: node.appPassword,
    },
    requireTLS: true,
  });

  try {
    await transporter.sendMail({
      from: `"${opts.senderName} via ORACLEX" <${node.gmailUsername}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    // Success — increment sent count and update timestamp
    await db
      .update(smtpPoolTable)
      .set({
        dailySentCount: node.dailySentCount + 1,
        lastUsedTimestamp: Date.now(),
      })
      .where(eq(smtpPoolTable.id, node.id));

    logger.info({ nodeId: node.id, to: opts.to }, "Email delivered successfully");
  } catch (err) {
    const error = err as Error;
    logger.error({ nodeId: node.id, error: error.message }, "SMTP delivery failed");

    // Determine failure type and update node status
    const rateLimitPatterns = [
      "daily sending quota exceeded",
      "rate limit",
      "too many",
      "quota",
      "limit exceeded",
    ];
    const isRateLimit = rateLimitPatterns.some((p) =>
      error.message.toLowerCase().includes(p),
    );

    await db
      .update(smtpPoolTable)
      .set({
        status: isRateLimit ? "rate_limited" : "locked",
        lastUsedTimestamp: Date.now(),
      })
      .where(eq(smtpPoolTable.id, node.id));

    // Re-throw so the queue can retry with a different node
    throw error;
  }
}
