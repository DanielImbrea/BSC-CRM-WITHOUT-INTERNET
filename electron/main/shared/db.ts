import type { Prisma, PrismaClient as PrismaClientInstance } from "prisma-client";
import { PrismaClient } from "./prisma";
import { configurePrismaEnginePaths } from "./prisma-engines";
import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

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
  const filePath = resolveDatabaseFilePath();
  // Prisma SQLite pe Windows: file:C:/path (NU file:/// — cauzează SQLite error 14).
  const normalized = filePath.replace(/\\/g, "/");
  if (/^[A-Za-z]:\//.test(normalized)) {
    return `file:${normalized}`;
  }
  return pathToFileURL(filePath).href;
}

/** Creează folderul și fișierul .db dacă lipsesc (Windows poate eșua la primul open). */
export function ensureDatabaseFileReady(): void {
  const filePath = resolveDatabaseFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.closeSync(fs.openSync(filePath, "a"));
  }
}

export function prepareDatabaseEnvironment(): string {
  ensureDatabaseFileReady();
  const url = resolveDatabaseUrl();
  process.env.DATABASE_URL = url;
  return url;
}

/** Calea absolută pe disc a fișierului .db — folosită de modulul Backup pentru copiere directă. */
export function getDatabaseFilePath(): string {
  return resolveDatabaseFilePath();
}

let prismaInstance: PrismaClientInstance | null = null;

export function getPrismaClient(): PrismaClientInstance {
  if (!prismaInstance) {
    configurePrismaEnginePaths();
    process.env.DATABASE_URL = resolveDatabaseUrl();
    prismaInstance = new PrismaClient({
      log: ["error", "warn"],
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

/** Șterge baza coruptă/parțial inițializată și recreează fișierul gol. */
export async function resetDatabaseFile(): Promise<void> {
  await disconnectPrisma();

  const filePath = resolveDatabaseFilePath();
  for (const suffix of ["", "-wal", "-shm"]) {
    const candidate = `${filePath}${suffix}`;
    if (fs.existsSync(candidate)) {
      fs.unlinkSync(candidate);
    }
  }

  ensureDatabaseFileReady();
  process.env.DATABASE_URL = resolveDatabaseUrl();
}
