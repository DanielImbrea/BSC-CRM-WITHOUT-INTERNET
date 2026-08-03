import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import type { PrismaClient } from "prisma-client";
import { logger } from "./logger";

function resolveMigrationsDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "prisma/migrations");
  }
  return path.resolve(process.cwd(), "prisma/migrations");
}

/**
 * Fallback dacă `prisma migrate deploy` eșuează în app-ul împachetat.
 * Rulează fișierele migration.sql în ordine lexicografică.
 */
export async function applySqlMigrationsFallback(db: PrismaClient): Promise<void> {
  // Verifică dacă schema există deja — evită re-aplicarea migrărilor distructive.
  try {
    await db.$queryRawUnsafe("SELECT 1 FROM AppAuth LIMIT 1");
    logger.info("Fallback SQL: schema deja există, sar peste.");
    return;
  } catch {
    // Schema lipsește — continuăm cu migrările.
  }

  const migrationsDir = resolveMigrationsDir();
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Folder migrări negăsit: ${migrationsDir}`);
  }

  const migrationFolders = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  logger.info(`Fallback SQL: ${migrationFolders.length} migrări găsite.`);

  for (const folder of migrationFolders) {
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;

    const sql = fs.readFileSync(sqlPath, "utf8");
    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0 && !statement.startsWith("--"));

    for (const statement of statements) {
      await db.$executeRawUnsafe(`${statement};`);
    }

    logger.info(`Fallback SQL: migrare aplicată — ${folder}`);
  }
}
