import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { smtpPoolTable } from "@workspace/db";
import { eq, and, lt, sum, sql } from "drizzle-orm";
import { requireApiKey } from "../../middlewares/auth";

const router: IRouter = Router();

// GET /v1/smtp/pool
router.get("/pool", requireApiKey, async (_req, res): Promise<void> => {
  const nodes = await db.select().from(smtpPoolTable).orderBy(smtpPoolTable.id);

  const activeCount = nodes.filter((n) => n.status === "active").length;

  const totalCapacityRemaining = nodes
    .filter((n) => n.status === "active")
    .reduce((acc, n) => acc + (n.maxDailyLimit - n.dailySentCount), 0);

  res.json({
    nodes: nodes.map((n) => ({
      id: n.id,
      gmailUsername: n.gmailUsername,
      dailySentCount: n.dailySentCount,
      maxDailyLimit: n.maxDailyLimit,
      lastUsedTimestamp: Number(n.lastUsedTimestamp),
      status: n.status,
    })),
    activeCount,
    totalCapacityRemaining,
  });
});

export default router;
