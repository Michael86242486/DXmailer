import cron from "node-cron";
import { db } from "@workspace/db";
import { smtpPoolTable } from "@workspace/db";
import { ne } from "drizzle-orm";
import { logger } from "../lib/logger";

/**
 * Resets daily sent counts for all non-locked SMTP nodes at 00:00 UTC.
 * Equivalent to the Cloudflare Cron Trigger scheduled event handler.
 */
export function startDailyResetCron(): void {
  cron.schedule(
    "0 0 * * *",
    async () => {
      logger.info("Running daily SMTP pool reset");
      try {
        const result = await db
          .update(smtpPoolTable)
          .set({ dailySentCount: 0 })
          .where(ne(smtpPoolTable.status, "locked"))
          .returning({ id: smtpPoolTable.id });

        logger.info({ resetCount: result.length }, "SMTP pool daily reset complete");

        // Also reactivate rate_limited nodes after reset
        const { smtpPoolStatusEnum } = await import("@workspace/db");
        void smtpPoolStatusEnum; // type ref only
        await db
          .update(smtpPoolTable)
          .set({ status: "active" })
          .where(ne(smtpPoolTable.status, "locked"));

        logger.info("Rate-limited nodes reactivated after daily reset");
      } catch (err) {
        logger.error({ error: (err as Error).message }, "Daily SMTP reset failed");
      }
    },
    {
      timezone: "UTC",
    },
  );

  logger.info("Daily SMTP reset cron scheduled (00:00 UTC)");
}
