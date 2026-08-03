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

/** Elimină comentariile pe linie — altfel statement-urile Prisma (-- CreateTable\nCREATE...) sunt ignorate. */
function stripSqlLineComments(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
}

function parseSqlStatements(sql: string): string[] {
  return stripSqlLineComments(sql)
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function schemaHasAppAuth(db: PrismaClient): Promise<boolean> {
  try {
    await db.$queryRawUnsafe("SELECT 1 FROM AppAuth LIMIT 1");
    return true;
  } catch {
    return false;
  }
}

/**
 * Fallback dacă `prisma migrate deploy` eșuează în app-ul împachetat.
 * Rulează fișierele migration.sql în ordine lexicografică.
 */
export async function applySqlMigrationsFallback(db: PrismaClient): Promise<void> {
  if (await schemaHasAppAuth(db)) {
    logger.info("Fallback SQL: schema deja există, sar peste.");
    return;
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

    const statements = parseSqlStatements(fs.readFileSync(sqlPath, "utf8"));

    for (const statement of statements) {
      await db.$executeRawUnsafe(`${statement};`);
    }

    logger.info(`Fallback SQL: migrare aplicată — ${folder}`);
  }
}

/** Verifică că tabelele există; aplică fallback dacă migrarea CLI a eșuat silențios. */
export async function ensureDatabaseSchema(db: PrismaClient): Promise<void> {
  if (await schemaHasAppAuth(db)) {
    return;
  }

  logger.warn("Schema incompletă după migrare — aplic fallback SQL.");
  await applySqlMigrationsFallback(db);

  if (!(await schemaHasAppAuth(db))) {
    throw new Error(
      "Baza de date nu a putut fi inițializată. Șterge folderul database din AppData și repornește aplicația.",
    );
  }
}
