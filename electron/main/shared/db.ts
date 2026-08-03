import type { Prisma, PrismaClient as PrismaClientInstance } from "@prisma/client";
import { PrismaClient } from "./prisma";
import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// ESM nu expune __dirname — reconstruim ca în electron/main/index.ts.
const moduleDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Tip acceptat de orice repository care trebuie să poată rula fie pe
 * clientul Prisma normal, fie în interiorul unei tranzacții ($transaction) —
 * esențial pentru operațiuni compuse ca cele din modulul Lucrări.
 */
export type DbClient = PrismaClientInstance | Prisma.TransactionClient;

let cachedDbFilePath: string | null = null;

/**
 * Locația bazei de date SQLite.
 *
 * - În dezvoltare: folosim DATABASE_URL din .env (ex: file:./lab-manager.db).
 * - În aplicația împachetată: baza trebuie să stea în userData (folder scriptibil,
 *   specific fiecărui utilizator/instalare), NU lângă executabil (read-only pe Windows/Mac
 *   după instalare) și NU în resources (e înlocuit la fiecare update al aplicației).
 */
function resolveDatabaseFilePath(): string {
  if (cachedDbFilePath) return cachedDbFilePath;

  if (!app.isPackaged) {
    const envUrl = process.env.DATABASE_URL ?? "file:./lab-manager.db";
    const relativePath = envUrl.replace(/^file:/, "");
    // Prisma CLI rezolvă căile relative față de prisma/schema.prisma, nu față de cwd.
    // Aliniem același comportament ca migrate/dev să folosească aceeași bază.
    const prismaDir = path.resolve(moduleDir, "../../prisma");
    cachedDbFilePath = path.isAbsolute(relativePath)
      ? relativePath
      : path.resolve(prismaDir, relativePath);
    return cachedDbFilePath;
  }

  const userDataDir = app.getPath("userData");
  const dbDir = path.join(userDataDir, "database");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  cachedDbFilePath = path.join(dbDir, "lab-manager.db");
  return cachedDbFilePath;
}

function resolveDatabaseUrl(): string {
  return `file:${resolveDatabaseFilePath()}`;
}

/** Calea absolută pe disc a fișierului .db — folosită de modulul Backup pentru copiere directă. */
export function getDatabaseFilePath(): string {
  return resolveDatabaseFilePath();
}

let prismaInstance: PrismaClientInstance | null = null;

export function getPrismaClient(): PrismaClientInstance {
  if (!prismaInstance) {
    process.env.DATABASE_URL = resolveDatabaseUrl();
    prismaInstance = new PrismaClient({
      log: app.isPackaged ? ["error", "warn"] : ["error", "warn", "query"],
    });
  }
  return prismaInstance;
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
