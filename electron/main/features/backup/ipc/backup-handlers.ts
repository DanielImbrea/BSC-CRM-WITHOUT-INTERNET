import { dialog } from "electron";
import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  BackupRecordDto,
  RestoreBackupRequest,
  DeleteBackupRequest,
  ExportBackupRequest,
  ExportBackupResponse,
  ImportAndRestoreResponse,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as backupUseCases from "../application/backup-use-cases";
import type { BackupRecordRow } from "../infrastructure/backup-repository";

function toDto(record: BackupRecordRow): BackupRecordDto {
  return {
    id: record.id,
    filePath: record.filePath,
    sizeBytes: record.sizeBytes,
    type: record.type === "AUTO" ? "AUTO" : "MANUAL",
    createdAt: record.createdAt.toISOString(),
  };
}

export function registerBackupHandlers(): void {
  registerIpcHandler<void, BackupRecordDto[]>(IPC_CHANNELS.BACKUP_LIST, async () => {
    const backups = await backupUseCases.listBackups();
    return backups.map(toDto);
  });

  registerIpcHandler<void, BackupRecordDto>(IPC_CHANNELS.BACKUP_CREATE, async () => {
    const backup = await backupUseCases.createBackup("MANUAL");
    return toDto(backup);
  });

  registerIpcHandler<RestoreBackupRequest, void>(IPC_CHANNELS.BACKUP_RESTORE, async (payload) => {
    await backupUseCases.restoreBackup(payload.id);
  });

  registerIpcHandler<DeleteBackupRequest, void>(IPC_CHANNELS.BACKUP_DELETE, async (payload) => {
    await backupUseCases.deleteBackup(payload.id);
  });

  registerIpcHandler<ExportBackupRequest, ExportBackupResponse>(
    IPC_CHANNELS.BACKUP_EXPORT,
    async (payload) => {
      const result = await dialog.showSaveDialog({
        title: "Exportă backup",
        defaultPath: `lab-manager-backup-${new Date().toISOString().slice(0, 10)}.db`,
        filters: [{ name: "Bază de date", extensions: ["db"] }],
      });
      if (result.canceled || !result.filePath) {
        return { exported: false, savedPath: null };
      }
      await backupUseCases.exportBackupTo(payload.id, result.filePath);
      return { exported: true, savedPath: result.filePath };
    },
  );

  registerIpcHandler<void, ImportAndRestoreResponse>(
    IPC_CHANNELS.BACKUP_IMPORT_RESTORE,
    async () => {
      const result = await dialog.showOpenDialog({
        title: "Selectează un fișier de backup",
        properties: ["openFile"],
        filters: [{ name: "Bază de date", extensions: ["db"] }],
      });
      if (result.canceled || result.filePaths.length === 0) {
        return {};
      }
      const sourcePath = result.filePaths[0];
      await backupUseCases.importAndRestore(sourcePath);
      return { restoredFrom: sourcePath };
    },
  );
}
