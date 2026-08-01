import { ValidationError } from "../../../shared/errors";

/**
 * Chei fixe, cunoscute — nu expunem un API generic de key-value arbitrar
 * către renderer (ar fi greu de validat și ușor de folosit greșit).
 * Orice setare nouă se adaugă aici explicit.
 */
export const SETTINGS_KEYS = {
  AUTO_BACKUP_ENABLED: "autoBackupEnabled",
  MAX_BACKUPS_RETAINED: "maxBackupsRetained",
} as const;

export const DEFAULT_SETTINGS = {
  autoBackupEnabled: false,
  maxBackupsRetained: 10,
};

export function assertMaxBackupsRetainedIsValid(value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new ValidationError("Numărul maxim de backup-uri păstrate trebuie să fie între 1 și 100.");
  }
}
