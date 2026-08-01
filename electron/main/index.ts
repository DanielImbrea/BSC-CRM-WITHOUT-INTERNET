import { app, BrowserWindow, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerAllIpcHandlers } from "./register-ipc-handlers";
import { getPrismaClient, disconnectPrisma } from "./shared/db";
import { logger } from "./shared/logger";
import { getAutoBackupSettingsUnsafe } from "./features/settings/application/settings-use-cases";
import { createBackup, pruneOldBackups } from "./features/backup/application/backup-use-cases";

// __dirname nu există implicit în build-ul ESM al lui vite-plugin-electron;
// îl reconstruim explicit pentru compatibilitate.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

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
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Orice link extern se deschide în browser-ul implicit al sistemului,
  // niciodată într-o fereastră Electron nouă (suprafață de atac redusă).
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
  // Forțează conectarea la pornire, ca eventualele erori (fișier corupt,
  // permisiuni lipsă) să apară imediat, nu la prima acțiune a utilizatorului.
  const db = getPrismaClient();
  await db.$connect();
  logger.info("Baza de date conectată.");
}

app.whenReady().then(async () => {
  try {
    await initializeDatabase();
    registerAllIpcHandlers();
    createMainWindow();
  } catch (error) {
    logger.error("Eroare fatală la pornirea aplicației:", error);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
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

    await createBackup("AUTO");
    await pruneOldBackups(settings.maxBackupsRetained);
    logger.info("Backup automat creat la închiderea aplicației.");
  } catch (error) {
    // Backup-ul automat nu trebuie NICIODATĂ să blocheze închiderea aplicației
    // (ex: dacă utilizatorul nu era autentificat, sau discul e plin).
    logger.warn("Backup automat eșuat la închidere:", error);
  }
}

app.on("before-quit", async (event) => {
  event.preventDefault();
  await performAutoBackupIfEnabled();
  await disconnectPrisma();
  app.exit(0);
});
