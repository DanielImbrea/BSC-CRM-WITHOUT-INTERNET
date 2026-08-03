import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { formatDate, formatRon, PAYMENT_STATUS_LABELS } from "@/shared/lib/format";
import { paymentStatusBadgeVariant, PaymentStatusSelect } from "./payment-status-select";
import type { PaymentStatus, WorkListItem } from "@shared-types/ipc";

interface WorksTableProps {
  works: WorkListItem[];
  onEdit?: (work: WorkListItem) => void;
  onDelete?: (work: WorkListItem) => void;
  onPaymentStatusChange?: (work: WorkListItem, status: PaymentStatus) => void;
  showActions?: boolean;
}

export function WorksTable({
  works,
  onEdit,
  onDelete,
  onPaymentStatusChange,
  showActions = true,
}: WorksTableProps) {
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
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Pacient</th>
            <th className="px-4 py-3 font-medium">Doctor</th>
            <th className="px-4 py-3 font-medium">Lucrări</th>
            <th className="px-4 py-3 font-medium">Total doctor</th>
            <th className="px-4 py-3 font-medium">Total tehnician</th>
            <th className="px-4 py-3 font-medium">Plată</th>
            {showActions && <th className="px-4 py-3 font-medium text-right">Acțiuni</th>}
          </tr>
        </thead>
        <tbody>
          {works.map((work) => (
            <tr key={work.id} className="border-b border-border last:border-0 hover:bg-accent/40">
              <td className="px-4 py-3 text-muted-foreground">{formatDate(work.entryDate)}</td>
              <td className="px-4 py-3 font-medium text-foreground">{work.patientName}</td>
              <td className="px-4 py-3 text-muted-foreground">{work.doctorName}</td>
              <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={work.workSummary}>
                {work.workSummary}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatRon(work.doctorTotal)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatRon(work.technicianTotal)}</td>
              <td className="px-4 py-3">
                {onPaymentStatusChange ? (
                  <PaymentStatusSelect
                    compact
                    value={work.paymentStatus}
                    onChange={(status) => status && onPaymentStatusChange(work, status)}
                    placeholder={PAYMENT_STATUS_LABELS[work.paymentStatus]}
                  />
                ) : (
                  <Badge variant={paymentStatusBadgeVariant(work.paymentStatus)}>
                    {PAYMENT_STATUS_LABELS[work.paymentStatus]}
                  </Badge>
                )}
              </td>
              {showActions && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit?.(work)} aria-label="Editează">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete?.(work)} aria-label="Șterge">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
