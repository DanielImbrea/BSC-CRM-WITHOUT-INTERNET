import { app } from "electron";
import path from "node:path";
import fs from "node:fs";

/**
 * Logger simplu, fără dependențe externe.
 * Scrie în consolă mereu, și suplimentar într-un fișier rotativ pe zi
 * în userData/logs, util pentru diagnosticarea problemelor la utilizator final
 * (unde nu avem acces la DevTools).
 */
function getLogFilePath(): string {
  const logsDir = path.join(app.getPath("userData"), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const today = new Date().toISOString().slice(0, 10);
  return path.join(logsDir, `${today}.log`);
}

function writeToFile(level: string, args: unknown[]): void {
  try {
    const line = `[${new Date().toISOString()}] [${level}] ${args
      .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
      .join(" ")}\n`;
    fs.appendFileSync(getLogFilePath(), line);
  } catch {
    // Nu blocăm aplicația dacă scrierea în log eșuează (ex: disc plin).
  }
}

export const logger = {
  info(...args: unknown[]): void {
    console.log("[INFO]", ...args);
    if (app.isReady()) writeToFile("INFO", args);
  },
  warn(...args: unknown[]): void {
    console.warn("[WARN]", ...args);
    if (app.isReady()) writeToFile("WARN", args);
  },
  error(...args: unknown[]): void {
    console.error("[ERROR]", ...args);
    if (app.isReady()) writeToFile("ERROR", args);
  },
};
