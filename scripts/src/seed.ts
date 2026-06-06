import { db, developersTable, smtpPoolTable } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  // Seed developer test account
  await db
    .insert(developersTable)
    .values({
      id: "dev-test-uuid",
      apiKey: "oraclex_live_test_key_xyz123",
      companyName: "Sandbox Dev Inc",
      rateLimitPerMin: 60,
    })
    .onConflictDoNothing();

  // Seed SMTP pool relay nodes
  await db
    .insert(smtpPoolTable)
    .values([
      {
        gmailUsername: "oraclex.relay01@gmail.com",
        appPassword: "jgffyxztpedbbqxp",
        dailySentCount: 0,
        maxDailyLimit: 500,
        lastUsedTimestamp: 0,
        status: "active",
      },
      {
        gmailUsername: "oraclex.relay02@gmail.com",
        appPassword: "fhlnqzrghwqfwzgb",
        dailySentCount: 0,
        maxDailyLimit: 500,
        lastUsedTimestamp: 0,
        status: "active",
      },
    ])
    .onConflictDoNothing();

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
