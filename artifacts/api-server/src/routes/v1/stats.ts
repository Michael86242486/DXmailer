import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { emailLogsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireApiKey } from "../../middlewares/auth";

const router: IRouter = Router();

// GET /v1/stats
router.get("/", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;

  const rows = await db
    .select({ status: emailLogsTable.status, value: count() })
    .from(emailLogsTable)
    .where(eq(emailLogsTable.developerId, developer.id))
    .groupBy(emailLogsTable.status);

  const byStatus: Record<string, number> = {};
  for (const row of rows) {
    byStatus[row.status] = Number(row.value);
  }

  const sent = byStatus["sent"] ?? 0;
  const failed = byStatus["failed"] ?? 0;
  const queued = byStatus["queued"] ?? 0;
  const total = sent + failed + queued;
  const successRate = total > 0 ? Math.round((sent / total) * 10000) / 100 : 0;

  res.json({ total, sent, failed, queued, successRate });
});

export default router;
