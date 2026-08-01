import { IPC_CHANNELS } from "@shared-types/ipc";
import type { ListAuditLogFilters, AuditLogPageDto, AuditLogEntryDto } from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as auditLogUseCases from "../application/audit-log-use-cases";
import type { AuditLogEntryRow } from "../infrastructure/audit-log-repository";

function toDto(row: AuditLogEntryRow): AuditLogEntryDto {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    before: row.before,
    after: row.after,
    createdAt: row.createdAt.toISOString(),
  };
}

export function registerAuditLogHandlers(): void {
  registerIpcHandler<ListAuditLogFilters, AuditLogPageDto>(IPC_CHANNELS.AUDIT_LOG_LIST, async (payload) => {
    const { entries, total } = await auditLogUseCases.listAuditLogs({
      entityType: payload?.entityType,
      action: payload?.action,
      dateFrom: payload?.dateFrom ? new Date(payload.dateFrom) : undefined,
      dateTo: payload?.dateTo ? new Date(payload.dateTo) : undefined,
      skip: payload?.skip,
      take: payload?.take,
    });
    return { entries: entries.map(toDto), total };
  });

  registerIpcHandler<void, string[]>(IPC_CHANNELS.AUDIT_LOG_LIST_ENTITY_TYPES, async () => {
    return auditLogUseCases.listAuditEntityTypes();
  });

  registerIpcHandler<void, string[]>(IPC_CHANNELS.AUDIT_LOG_LIST_ACTIONS, async () => {
    return auditLogUseCases.listAuditActions();
  });
}
