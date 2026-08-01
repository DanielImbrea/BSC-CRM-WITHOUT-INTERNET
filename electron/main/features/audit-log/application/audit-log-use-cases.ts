import { auditLogRepository, type AuditLogFilters, type AuditLogEntryRow } from "../infrastructure/audit-log-repository";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listAuditLogs(
  filters: AuditLogFilters,
): Promise<{ entries: AuditLogEntryRow[]; total: number }> {
  requireAuthenticated();
  return auditLogRepository.findPage(filters);
}

export async function listAuditEntityTypes(): Promise<string[]> {
  requireAuthenticated();
  return auditLogRepository.listDistinctEntityTypes();
}

export async function listAuditActions(): Promise<string[]> {
  requireAuthenticated();
  return auditLogRepository.listDistinctActions();
}
