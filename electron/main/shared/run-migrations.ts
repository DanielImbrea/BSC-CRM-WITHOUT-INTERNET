import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import { configurePrismaEnginePaths } from "./prisma-engines";
import { logger } from "./logger";

function resolveSchemaPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "prisma/schema.prisma");
  }
  return path.resolve(process.cwd(), "prisma/schema.prisma");
}

function resolvePrismaCliPath(): string {
  const candidates = app.isPackaged
    ? [
        path.join(process.resourcesPath, "app.asar.unpacked/node_modules/prisma/build/index.js"),
        path.join(process.resourcesPath, "app/node_modules/prisma/build/index.js"),
      ]
    : [path.resolve(process.cwd(), "node_modules/prisma/build/index.js")];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error("Prisma CLI nu a fost găsit în pachetul aplicației.");
}

/**
 * Aplică migrările Prisma în app-ul împachetat.
 * Fără acest pas, baza SQLite din userData e goală și auth/CRUD eșuează.
 */
export function runDatabaseMigrations(databaseUrl: string): void {
  configurePrismaEnginePaths();
  const schemaPath = resolveSchemaPath();
  const prismaCli = resolvePrismaCliPath();

  logger.info("Rulez migrările bazei de date...");

  const result = spawnSync(
    process.execPath,
    [prismaCli, "migrate", "deploy", "--schema", schemaPath],
    {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        ELECTRON_RUN_AS_NODE: "1",
      },
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    const details = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
    throw new Error(`Migrarea bazei de date a eșuat.${details ? `\n${details}` : ""}`);
  }

  logger.info("Migrările bazei de date au fost aplicate.");
}
