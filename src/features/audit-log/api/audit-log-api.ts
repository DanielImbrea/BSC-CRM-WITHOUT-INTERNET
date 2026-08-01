import type { ListAuditLogFilters, AuditLogPageDto } from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const auditLogApi = {
  async list(filters: ListAuditLogFilters): Promise<AuditLogPageDto> {
    return unwrapIpc(await window.labManager.auditLog.list(filters));
  },
  async listEntityTypes(): Promise<string[]> {
    return unwrapIpc(await window.labManager.auditLog.listEntityTypes());
  },
  async listActions(): Promise<string[]> {
    return unwrapIpc(await window.labManager.auditLog.listActions());
  },
};
