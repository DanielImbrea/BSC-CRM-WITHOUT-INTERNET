import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { WorkStatusBadge } from "@/shared/components/work-status-badge";
import { formatMoney, formatDate } from "@/shared/lib/utils";
import type { WorkListItem } from "@shared-types/ipc";

interface WorksTableProps {
  works: WorkListItem[];
  onView: (work: WorkListItem) => void;
  onDelete: (work: WorkListItem) => void;
}

export function WorksTable({ works, onView, onDelete }: WorksTableProps) {
  if (works.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Nicio lucrare încă</p>
        <p className="text-sm text-muted-foreground">Adaugă prima lucrare cu butonul de mai sus.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Titlu</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Început la</th>
            <th className="px-4 py-3 font-medium">Cost total</th>
            <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {works.map((work) => (
            <tr key={work.id} className="border-b border-border last:border-0 hover:bg-accent/40">
              <td className="px-4 py-3 font-medium text-foreground">{work.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{work.clientName}</td>
              <td className="px-4 py-3">
                <WorkStatusBadge status={work.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(work.startedAt)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatMoney(work.totalCost)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(work)} aria-label="Vezi detalii">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(work)} aria-label="Șterge">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
