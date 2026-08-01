import type { BackupRecordDto, ExportBackupResponse, ImportAndRestoreResponse } from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const backupApi = {
  async list(): Promise<BackupRecordDto[]> {
    return unwrapIpc(await window.labManager.backup.list());
  },
  async create(): Promise<BackupRecordDto> {
    return unwrapIpc(await window.labManager.backup.create());
  },
  async restore(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.backup.restore({ id }));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.backup.delete({ id }));
  },
  async exportBackup(id: string): Promise<ExportBackupResponse> {
    return unwrapIpc(await window.labManager.backup.export({ id }));
  },
  async importAndRestore(): Promise<ImportAndRestoreResponse> {
    return unwrapIpc(await window.labManager.backup.importAndRestore());
  },
};
