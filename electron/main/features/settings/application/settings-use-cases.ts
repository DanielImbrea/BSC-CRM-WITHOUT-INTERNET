import { settingsRepository } from "../infrastructure/settings-repository";
import { SETTINGS_KEYS, DEFAULT_SETTINGS, assertMaxBackupsRetainedIsValid } from "../domain/settings-keys";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export interface AppSettings {
  autoBackupEnabled: boolean;
  maxBackupsRetained: number;
}

async function readSettings(): Promise<AppSettings> {
  const [autoBackupEnabledRaw, maxBackupsRetainedRaw] = await Promise.all([
    settingsRepository.get(SETTINGS_KEYS.AUTO_BACKUP_ENABLED),
    settingsRepository.get(SETTINGS_KEYS.MAX_BACKUPS_RETAINED),
  ]);

  return {
    autoBackupEnabled:
      autoBackupEnabledRaw !== null ? autoBackupEnabledRaw === "true" : DEFAULT_SETTINGS.autoBackupEnabled,
    maxBackupsRetained:
      maxBackupsRetainedRaw !== null ? Number(maxBackupsRetainedRaw) : DEFAULT_SETTINGS.maxBackupsRetained,
  };
}

export async function getAppSettings(): Promise<AppSettings> {
  requireAuthenticated();
  return readSettings();
}

export async function updateAppSettings(settings: AppSettings): Promise<AppSettings> {
  requireAuthenticated();
  assertMaxBackupsRetainedIsValid(settings.maxBackupsRetained);

  await Promise.all([
    settingsRepository.set(SETTINGS_KEYS.AUTO_BACKUP_ENABLED, String(settings.autoBackupEnabled)),
    settingsRepository.set(SETTINGS_KEYS.MAX_BACKUPS_RETAINED, String(settings.maxBackupsRetained)),
  ]);

  return settings;
}

/**
 * Citire directă, fără `requireAuthenticated` — folosită la închiderea
 * aplicației (main/index.ts), unde nu vrem ca lipsa autentificării să
 * blocheze verificarea setării de backup automat.
 */
export async function getAutoBackupSettingsUnsafe(): Promise<AppSettings> {
  return readSettings();
}
