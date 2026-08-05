import { app, BrowserWindow, shell, dialog } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerAllIpcHandlers } from "./register-ipc-handlers";
import {
  getPrismaClient,
  disconnectPrisma,
  prepareDatabaseEnvironment,
  getDatabaseFilePath,
} from "./shared/db";
import { configurePrismaEnginePaths } from "./shared/prisma-engines";
import { runDatabaseMigrations } from "./shared/run-migrations";
import { ensureDatabaseSchema } from "./shared/apply-sql-migrations";
import { logger } from "./shared/logger";
import { getAutoBackupSettingsUnsafe } from "./features/settings/application/settings-use-cases";
import { createBackup, pruneOldBackups } from "./features/backup/application/backup-use-cases";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

// O singură instanță — evită coruperea SQLite pe Windows (double-click rapid).
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function initializeDatabase(): Promise<void> {
  const databaseUrl = prepareDatabaseEnvironment();
  configurePrismaEnginePaths();

  // Nu ținem conexiune deschisă în timpul migrate deploy — SQLite lock pe Windows.
  await disconnectPrisma();

  try {
    runDatabaseMigrations(databaseUrl);
  } catch (error) {
    logger.warn("Migrare Prisma CLI eșuată — voi aplica bootstrap SQL dacă e necesar:", error);
  }

  let db = getPrismaClient();
  await db.$connect();
  db = await ensureDatabaseSchema(db);

  logger.info("Baza de date conectată.", getDatabaseFilePath());
}

function showFatalStartupError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const logsDir = app.isReady() ? path.join(app.getPath("userData"), "logs") : "";
  const details = logsDir ? `\n\nLoguri: ${logsDir}` : "";

  dialog.showErrorBox(
    "Billionaire Smile Club CRM — eroare la pornire",
    `${message}${details}`,
  );
}

app.whenReady().then(async () => {
  try {
    await initializeDatabase();
    registerAllIpcHandlers();
    createMainWindow();
  } catch (error) {
    logger.error("Eroare fatală la pornirea aplicației:", error);
    showFatalStartupError(error);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function performAutoBackupIfEnabled(): Promise<void> {
  try {
    const settings = await getAutoBackupSettingsUnsafe();
    if (!settings.autoBackupEnabled) return;

    await createBackup("AUTO", { skipAuth: true });
    await pruneOldBackups(settings.maxBackupsRetained, { skipAuth: true });
    logger.info("Backup automat creat la închiderea aplicației.");
  } catch (error) {
    logger.warn("Backup automat eșuat la închidere:", error);
  }
}

app.on("before-quit", async (event) => {
  event.preventDefault();
  await performAutoBackupIfEnabled();
  await disconnectPrisma();
  app.exit(0);
});
