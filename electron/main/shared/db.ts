import { PrismaClient, type Prisma } from "@prisma/client";
import { app } from "electron";
import path from "node:path";
import fs from "node:fs";

/**
 * Tip acceptat de orice repository care trebuie să poată rula fie pe
 * clientul Prisma normal, fie în interiorul unei tranzacții ($transaction) —
 * esențial pentru operațiuni compuse ca cele din modulul Lucrări.
 */
export type DbClient = PrismaClient | Prisma.TransactionClient;

let cachedDbFilePath: string | null = null;

/**
 * Locația bazei de date SQLite.
 *
 * - În dezvoltare: folosim DATABASE_URL din .env (ex: file:./prisma/lab-manager.db).
 * - În aplicația împachetată: baza trebuie să stea în userData (folder scriptibil,
 *   specific fiecărui utilizator/instalare), NU lângă executabil (read-only pe Windows/Mac
 *   după instalare) și NU în resources (e înlocuit la fiecare update al aplicației).
 */
function resolveDatabaseFilePath(): string {
  if (cachedDbFilePath) return cachedDbFilePath;

  if (!app.isPackaged) {
    const envUrl = process.env.DATABASE_URL ?? "file:./prisma/lab-manager.db";
    cachedDbFilePath = path.resolve(envUrl.replace(/^file:/, ""));
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

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
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
