import { type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { developersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Extend Express Request to carry developer context
declare global {
  namespace Express {
    interface Request {
      developer?: typeof developersTable.$inferSelect;
    }
  }
}

export async function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header. Use: Bearer <API_KEY>" });
    return;
  }

  const apiKey = authHeader.slice(7).trim();

  const [developer] = await db
    .select()
    .from(developersTable)
    .where(eq(developersTable.apiKey, apiKey))
    .limit(1);

  if (!developer) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  req.developer = developer;
  next();
}
