import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import type { PrismaClient } from "prisma-client";
import { getPrismaClient, resetDatabaseFile } from "./db";
import { logger } from "./logger";

/** Tabele obligatorii din schema curentă — verificare completă, nu doar AppAuth. */
const REQUIRED_TABLES = [
  "AppAuth",
  "Doctor",
  "Technician",
  "WorkType",
  "Work",
  "WorkLine",
  "Setting",
  "AuditLog",
  "BackupRecord",
] as const;

/** Tabele din versiunea veche (pre-restructurare) — semn de schema învechită. */
const LEGACY_TABLES = ["Client", "Material", "Employee", "CostEntry"] as const;

function resolveBootstrapSqlPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "prisma/bootstrap.sql");
  }
  return path.resolve(process.cwd(), "prisma/bootstrap.sql");
}

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

async function getExistingTables(db: PrismaClient): Promise<Set<string>> {
  const rows = await db.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
  );
  return new Set(rows.map((row) => row.name));
}

async function validateFullSchema(db: PrismaClient): Promise<{ ok: boolean; missing: string[] }> {
  const existing = await getExistingTables(db);
  const missing = REQUIRED_TABLES.filter((table) => !existing.has(table));
  return { ok: missing.length === 0, missing };
}

async function hasLegacySchema(db: PrismaClient): Promise<boolean> {
  const existing = await getExistingTables(db);
  const hasLegacy = LEGACY_TABLES.some((table) => existing.has(table));
  const hasCurrent = existing.has("Doctor") && existing.has("WorkLine");
  return hasLegacy && !hasCurrent;
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

async function reconnectPrisma(): Promise<PrismaClient> {
  const db = getPrismaClient();
  await db.$connect();
  return db;
}

async function resetAndReconnect(): Promise<PrismaClient> {
  await resetDatabaseFile();
  return reconnectPrisma();
}

/**
 * Verifică schema completă; resetează baze corupte/parțiale/învechite
 * și aplică bootstrap.sql ca ultimă variantă sigură.
 */
export async function ensureDatabaseSchema(db: PrismaClient): Promise<PrismaClient> {
  let activeDb = db;

  const initial = await validateFullSchema(activeDb);
  if (initial.ok) {
    return activeDb;
  }

  const legacy = await hasLegacySchema(activeDb);
  const hasAnyTable = (await getExistingTables(activeDb)).size > 0;

  if (legacy) {
    logger.warn("Schema înveche detectată — resetez baza pentru schema CRM dentar.");
    activeDb = await resetAndReconnect();
  } else if (hasAnyTable) {
    logger.warn(
      `Bază parțial inițializată (lipsesc: ${initial.missing.join(", ")}) — resetez fișierul .db.`,
    );
    activeDb = await resetAndReconnect();
  }

  logger.warn("Schema incompletă — aplic bootstrap SQL.");
  try {
    await applyBootstrapSchema(activeDb);
  } catch (error) {
    logger.error("Bootstrap eșuat — reîncerc după reset complet:", error);
    activeDb = await resetAndReconnect();
    await applyBootstrapSchema(activeDb);
  }

  const final = await validateFullSchema(activeDb);
  if (!final.ok) {
    throw new Error(
      `Baza de date nu a putut fi inițializată (lipsesc: ${final.missing.join(", ")}). ` +
        "Șterge folderul database din AppData și repornește aplicația.",
    );
  }

  return activeDb;
}
