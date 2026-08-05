import type { PrismaClient } from "prisma-client";
import { logger } from "./logger";

/** Coloane obligatorii — verificare la pornire (evită P2022 pe upgrade-uri parțiale). */
export const REQUIRED_COLUMNS: Record<string, readonly string[]> = {
  WorkLine: ["technician2Id", "technician3Id"],
};

interface ColumnPatch {
  table: string;
  column: string;
  alterSql: string;
}

interface IndexPatch {
  name: string;
  createSql: string;
}

const COLUMN_PATCHES: ColumnPatch[] = [
  {
    table: "WorkLine",
    column: "technician2Id",
    alterSql: `ALTER TABLE "WorkLine" ADD COLUMN "technician2Id" TEXT REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  },
  {
    table: "WorkLine",
    column: "technician3Id",
    alterSql: `ALTER TABLE "WorkLine" ADD COLUMN "technician3Id" TEXT REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  },
];

const INDEX_PATCHES: IndexPatch[] = [
  {
    name: "WorkLine_technician2Id_idx",
    createSql: `CREATE INDEX "WorkLine_technician2Id_idx" ON "WorkLine"("technician2Id")`,
  },
  {
    name: "WorkLine_technician3Id_idx",
    createSql: `CREATE INDEX "WorkLine_technician3Id_idx" ON "WorkLine"("technician3Id")`,
  },
];

async function getTableColumns(db: PrismaClient, table: string): Promise<Set<string>> {
  const rows = await db.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("${table}")`);
  return new Set(rows.map((row) => row.name));
}

async function indexExists(db: PrismaClient, indexName: string): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'index' AND name = '${indexName}'`,
  );
  return rows.length > 0;
}

async function tableExists(db: PrismaClient, table: string): Promise<boolean> {
  const rows = await db.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table}'`,
  );
  return rows.length > 0;
}

/**
 * Aplică ALTER TABLE / CREATE INDEX lipsă — fallback sigur când migrate deploy eșuează
 * pe Windows (P2022: coloană inexistentă după upgrade app fără migrare Prisma).
 */
export async function applySchemaPatches(db: PrismaClient): Promise<void> {
  for (const patch of COLUMN_PATCHES) {
    if (!(await tableExists(db, patch.table))) continue;

    const columns = await getTableColumns(db, patch.table);
    if (columns.has(patch.column)) continue;

    logger.warn(`Patch schema: adaug coloana ${patch.table}.${patch.column}`);
    await db.$executeRawUnsafe(`${patch.alterSql};`);
  }

  for (const patch of INDEX_PATCHES) {
    if (await indexExists(db, patch.name)) continue;
    if (!(await tableExists(db, "WorkLine"))) continue;

    logger.warn(`Patch schema: creez index ${patch.name}`);
    await db.$executeRawUnsafe(`${patch.createSql};`);
  }
}

export async function validateRequiredColumns(
  db: PrismaClient,
): Promise<{ ok: boolean; missing: string[] }> {
  const missing: string[] = [];

  for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
    if (!(await tableExists(db, table))) continue;

    const existing = await getTableColumns(db, table);
    for (const column of columns) {
      if (!existing.has(column)) {
        missing.push(`${table}.${column}`);
      }
    }
  }

  return { ok: missing.length === 0, missing };
}
