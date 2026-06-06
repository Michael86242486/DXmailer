import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { requireApiKey } from "../../middlewares/auth";

const router: IRouter = Router();

function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const random = Array.from({ length: 32 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return `oraclex_live_${random}`;
}

// POST /v1/developers — provision a new developer account
router.post("/", async (req, res): Promise<void> => {
  const { companyName, rateLimitPerMin } = req.body as {
    companyName?: unknown;
    rateLimitPerMin?: unknown;
  };

  if (!companyName || typeof companyName !== "string") {
    res.status(400).json({ error: "companyName is required" });
    return;
  }

  const rateLimit =
    typeof rateLimitPerMin === "number" && rateLimitPerMin > 0
      ? Math.floor(rateLimitPerMin)
      : 60;

  const id = randomUUID();
  const apiKey = generateApiKey();

  const [developer] = await db
    .insert(developersTable)
    .values({ id, apiKey, companyName, rateLimitPerMin: rateLimit })
    .returning();

  req.log.info({ developerId: id, companyName }, "Developer provisioned");

  res.status(201).json({
    id: developer!.id,
    apiKey: developer!.apiKey,
    companyName: developer!.companyName,
    rateLimitPerMin: developer!.rateLimitPerMin,
    createdAt: developer!.createdAt,
  });
});

// GET /v1/developers/me — get current developer profile
router.get("/me", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;
  res.json({
    id: developer.id,
    apiKey: developer.apiKey,
    companyName: developer.companyName,
    rateLimitPerMin: developer.rateLimitPerMin,
    createdAt: developer.createdAt,
  });
});

// POST /v1/developers/rotate-key — rotate the API key for the current developer
router.post("/rotate-key", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;
  const newKey = generateApiKey();

  const [updated] = await db
    .update(developersTable)
    .set({ apiKey: newKey })
    .where(eq(developersTable.id, developer.id))
    .returning();

  req.log.info({ developerId: developer.id }, "API key rotated");

  res.json({
    id: updated!.id,
    apiKey: updated!.apiKey,
    companyName: updated!.companyName,
    rateLimitPerMin: updated!.rateLimitPerMin,
    createdAt: updated!.createdAt,
  });
});

// PATCH /v1/developers/me — update rate limit or company name
router.patch("/me", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;
  const { companyName, rateLimitPerMin } = req.body as {
    companyName?: unknown;
    rateLimitPerMin?: unknown;
  };

  const patch: Partial<{ companyName: string; rateLimitPerMin: number }> = {};

  if (companyName !== undefined) {
    if (typeof companyName !== "string" || companyName.trim() === "") {
      res.status(400).json({ error: "companyName must be a non-empty string" });
      return;
    }
    patch.companyName = companyName.trim();
  }

  if (rateLimitPerMin !== undefined) {
    if (typeof rateLimitPerMin !== "number" || rateLimitPerMin <= 0) {
      res.status(400).json({ error: "rateLimitPerMin must be a positive number" });
      return;
    }
    patch.rateLimitPerMin = Math.floor(rateLimitPerMin);
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: "Provide at least one field to update: companyName, rateLimitPerMin" });
    return;
  }

  const [updated] = await db
    .update(developersTable)
    .set(patch)
    .where(eq(developersTable.id, developer.id))
    .returning();

  req.log.info({ developerId: developer.id, patch }, "Developer profile updated");

  res.json({
    id: updated!.id,
    apiKey: updated!.apiKey,
    companyName: updated!.companyName,
    rateLimitPerMin: updated!.rateLimitPerMin,
    createdAt: updated!.createdAt,
  });
});

// DELETE /v1/developers/me — remove account and all associated logs
router.delete("/me", requireApiKey, async (req, res): Promise<void> => {
  const developer = req.developer!;

  await db
    .delete(developersTable)
    .where(eq(developersTable.id, developer.id));

  req.log.info({ developerId: developer.id }, "Developer account deleted");

  res.sendStatus(204);
});

export default router;
