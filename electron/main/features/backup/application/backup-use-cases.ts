import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import { backupRepository, type BackupRecordRow } from "../infrastructure/backup-repository";
import { assertLooksLikeDatabaseFile } from "../domain/backup-validation";
import { getDatabaseFilePath, disconnectPrisma, getPrismaClient } from "../../../shared/db";
import { NotFoundError, ConflictError, ValidationError } from "../../../shared/errors";
import { recordAuditEvent } from "../../audit-log/application/record-audit-event";
import { AUDIT_ACTIONS } from "../../audit-log/domain/audit-action";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";
import { logger } from "../../../shared/logger";

function getBackupsDir(): string {
  const dir = path.join(app.getPath("userData"), "backups");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function listBackups(): Promise<BackupRecordRow[]> {
  requireAuthenticated();
  return backupRepository.findAll();
}

/**
 * Creare backup: copiază fișierul .db curent într-un folder intern gestionat
 * de aplicație (userData/backups). Nu e o acțiune "critică" în sensul
 * politicii de audit (doar restaurările sunt) — nu se loghează.
 */
export async function createBackup(type: "MANUAL" | "AUTO" = "MANUAL"): Promise<BackupRecordRow> {
  requireAuthenticated();

  const dbPath = getDatabaseFilePath();
  if (!fs.existsSync(dbPath)) {
    throw new ValidationError("Fișierul bazei de date nu a fost găsit.");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFilePath = path.join(getBackupsDir(), `backup-${timestamp}.db`);

  fs.copyFileSync(dbPath, backupFilePath);
  const { size } = fs.statSync(backupFilePath);

  return backupRepository.create(backupFilePath, size, type);
}

/**
 * Restaurare — acțiune CRITICĂ: înlocuiește baza de date curentă cu
 * conținutul unui backup. Deconectăm Prisma înainte de copiere (SQLite
 * nu permite suprascrierea unui fișier cu conexiuni active pe Windows),
 * copiem, apoi reconectăm. Se loghează întotdeauna în audit.
 */
export async function restoreBackup(backupId: string): Promise<void> {
  requireAuthenticated();

  const record = await backupRepository.findById(backupId);
  if (!record) {
    throw new NotFoundError("BackupRecord", backupId);
  }
  if (!fs.existsSync(record.filePath)) {
    throw new ConflictError("Fișierul de backup nu mai există pe disc.");
  }

  await performRestore(record.filePath);

  await recordAuditEvent({
    action: AUDIT_ACTIONS.BACKUP_RESTORE,
    entityType: "BackupRecord",
    entityId: backupId,
    after: { restoredFrom: record.filePath },
  });
}

/**
 * Restaurare dintr-un fișier extern (ex: adus de pe alt calculator sau
 * de pe un stick USB), care nu face parte din istoricul intern de backup-uri.
 * Utilă pentru migrarea aplicației pe un alt calculator.
 */
export async function importAndRestore(sourcePath: string): Promise<void> {
  requireAuthenticated();
  assertLooksLikeDatabaseFile(sourcePath);

  if (!fs.existsSync(sourcePath)) {
    throw new ValidationError("Fișierul selectat nu a fost găsit.");
  }

  await performRestore(sourcePath);

  await recordAuditEvent({
    action: AUDIT_ACTIONS.BACKUP_RESTORE,
    entityType: "BackupRecord",
    after: { restoredFrom: sourcePath, imported: true },
  });
}

async function performRestore(sourcePath: string): Promise<void> {
  const dbPath = getDatabaseFilePath();
  await disconnectPrisma();
  try {
    fs.copyFileSync(sourcePath, dbPath);
  } finally {
    // Reconectăm mereu, chiar dacă restaurarea a eșuat — aplicația nu
    // poate rămâne fără o conexiune activă la baza de date.
    getPrismaClient();
  }
}

/**
 * Exportă un backup existent către o locație aleasă de utilizator
 * (ex: stick USB, folder de rețea). Simplă copiere — nu afectează
 * istoricul intern de backup-uri.
 */
export async function exportBackupTo(backupId: string, destinationPath: string): Promise<void> {
  requireAuthenticated();
  const record = await backupRepository.findById(backupId);
  if (!record) {
    throw new NotFoundError("BackupRecord", backupId);
  }
  if (!fs.existsSync(record.filePath)) {
    throw new ConflictError("Fișierul de backup nu mai există pe disc.");
  }
  fs.copyFileSync(record.filePath, destinationPath);
}

export async function deleteBackup(id: string): Promise<void> {
  requireAuthenticated();
  const existing = await backupRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("BackupRecord", id);
  }

  try {
    if (fs.existsSync(existing.filePath)) {
      fs.unlinkSync(existing.filePath);
    }
  } catch (error) {
    // Nu blocăm ștergerea înregistrării dacă fișierul nu poate fi șters
    // (ex: mutat manual de utilizator) — doar notăm în log.
    logger.warn("Nu s-a putut șterge fișierul de backup de pe disc:", error);
  }

  await backupRepository.delete(id);

  await recordAuditEvent({
    action: AUDIT_ACTIONS.DELETE,
    entityType: "BackupRecord",
    entityId: id,
    before: existing,
  });
}

/**
 * Păstrează doar cele mai recente `maxRetained` backup-uri, ștergând
 * restul (fișier + înregistrare, cu audit, prin deleteBackup existent).
 * Apelată după fiecare backup automat, conform setării din modulul Setări.
 */
export async function pruneOldBackups(maxRetained: number): Promise<void> {
  const all = await backupRepository.findAll();
  const excess = all.slice(maxRetained); // findAll e deja sortat descrescător după dată
  for (const backup of excess) {
    await deleteBackup(backup.id);
  }
}
