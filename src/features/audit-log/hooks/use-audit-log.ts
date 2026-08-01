import { useQuery } from "@tanstack/react-query";
import { auditLogApi } from "../api/audit-log-api";
import type { ListAuditLogFilters } from "@shared-types/ipc";

export function useAuditLog(filters: ListAuditLogFilters) {
  return useQuery({
    queryKey: ["audit-log", "list", filters],
    queryFn: () => auditLogApi.list(filters),
  });
}

export function useAuditEntityTypes() {
  return useQuery({
    queryKey: ["audit-log", "entity-types"],
    queryFn: auditLogApi.listEntityTypes,
  });
}

export function useAuditActions() {
  return useQuery({
    queryKey: ["audit-log", "actions"],
    queryFn: auditLogApi.listActions,
  });
}
