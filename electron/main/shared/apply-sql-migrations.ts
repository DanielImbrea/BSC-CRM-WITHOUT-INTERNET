import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import type { PrismaClient } from "prisma-client";
import { getPrismaClient, resetDatabaseFile } from "./db";
import { logger } from "./logger";

function resolveBootstrapSqlPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "prisma/bootstrap.sql");
  }
  return path.resolve(process.cwd(), "prisma/bootstrap.sql");
}

/** Elimină comentariile pe linie din scripturile SQL Prisma. */
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

async function databaseHasPartialSchema(db: PrismaClient): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*) AS count FROM sqlite_master
     WHERE type = 'table'
       AND name NOT LIKE 'sqlite_%'
       AND name != '_prisma_migrations'`,
  );
  const count = Number(rows[0]?.count ?? 0);
  return count > 0;
}

async function applyBootstrapSchema(db: PrismaClient): Promise<void> {
  const bootstrapPath = resolveBootstrapSqlPath();
  if (!fs.existsSync(bootstrapPath)) {
    throw new Error(`Fișier bootstrap SQL negăsit: ${bootstrapPath}`);
  }

  const statements = parseSqlStatements(fs.readFileSync(bootstrapPath, "utf8"));
  logger.info(`Bootstrap SQL: ${statements.length} statement-uri.`);

  for (const statement of statements) {
    await db.$executeRawUnsafe(`${statement};`);
  }
}

/**
 * Verifică schema după migrare; dacă lipsește AppAuth, resetează baza coruptă
 * și aplică bootstrap.sql (schema finală, fără migrări istorice conflictuale).
 */
export async function ensureDatabaseSchema(db: PrismaClient): Promise<PrismaClient> {
  if (await schemaHasAppAuth(db)) {
    return db;
  }

  let activeDb = db;

  if (await databaseHasPartialSchema(activeDb)) {
    logger.warn("Bază parțial inițializată detectată — resetez fișierul .db.");
    await resetDatabaseFile();
    activeDb = getPrismaClient();
    await activeDb.$connect();
  }

  logger.warn("Schema incompletă — aplic bootstrap SQL.");
  await applyBootstrapSchema(activeDb);

  if (!(await schemaHasAppAuth(activeDb))) {
    throw new Error(
      "Baza de date nu a putut fi inițializată. Șterge folderul database din AppData și repornește aplicația.",
    );
  }

  return activeDb;
}
