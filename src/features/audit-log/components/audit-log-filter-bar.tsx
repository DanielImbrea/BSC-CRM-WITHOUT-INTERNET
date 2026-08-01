import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { useAuditEntityTypes, useAuditActions } from "../hooks/use-audit-log";
import type { ListAuditLogFilters } from "@shared-types/ipc";

interface AuditLogFilterBarProps {
  filters: ListAuditLogFilters;
  onChange: (filters: ListAuditLogFilters) => void;
}

const ALL = "__all__";

export function AuditLogFilterBar({ filters, onChange }: AuditLogFilterBarProps) {
  const { data: entityTypes } = useAuditEntityTypes();
  const { data: actions } = useAuditActions();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Tip entitate</Label>
        <Select
          value={filters.entityType ?? ALL}
          onValueChange={(value) =>
            onChange({ ...filters, entityType: value === ALL ? undefined : value, skip: 0 })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Toate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toate</SelectItem>
            {entityTypes?.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Acțiune</Label>
        <Select
          value={filters.action ?? ALL}
          onValueChange={(value) => onChange({ ...filters, action: value === ALL ? undefined : value, skip: 0 })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toate</SelectItem>
            {actions?.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>De la data</Label>
        <Input
          type="date"
          className="w-40"
          value={filters.dateFrom?.slice(0, 10) ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              dateFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined,
              skip: 0,
            })
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Până la data</Label>
        <Input
          type="date"
          className="w-40"
          value={filters.dateTo?.slice(0, 10) ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              dateTo: e.target.value ? new Date(e.target.value).toISOString() : undefined,
              skip: 0,
            })
          }
        />
      </div>

      {(filters.entityType || filters.action || filters.dateFrom || filters.dateTo) && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ skip: 0 })}>
          Resetează filtrele
        </Button>
      )}
    </div>
  );
}
