import app from "./app";
import { logger } from "./lib/logger";
import { startDailyResetCron } from "./services/cronService";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Start the daily SMTP pool reset cron (00:00 UTC)
startDailyResetCron();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "ORACLEX MAIL ENGINE listening");
});
