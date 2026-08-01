import { formatDate } from "@/shared/lib/utils";
import type { AuditLogEntryDto } from "@shared-types/ipc";

interface AuditLogTableProps {
  entries: AuditLogEntryDto[];
  onSelect: (entry: AuditLogEntryDto) => void;
}

export function AuditLogTable({ entries, onSelect }: AuditLogTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Niciun eveniment înregistrat</p>
        <p className="text-sm text-muted-foreground">
          Aici apar ștergerile, modificările de salarii, autentificările și restaurările de backup.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Acțiune</th>
            <th className="px-4 py-3 font-medium">Entitate</th>
            <th className="px-4 py-3 font-medium">ID entitate</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-accent/40"
              onClick={() => onSelect(entry)}
            >
              <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.createdAt)}</td>
              <td className="px-4 py-3 font-medium text-foreground">{entry.action}</td>
              <td className="px-4 py-3 text-muted-foreground">{entry.entityType}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {entry.entityId ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
