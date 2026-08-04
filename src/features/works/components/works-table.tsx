import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { formatDate, PAYMENT_STATUS_LABELS } from "@/shared/lib/format";
import { paymentStatusBadgeVariant, PaymentStatusSelect } from "./payment-status-select";
import type { PaymentStatus, WorkListItem } from "@shared-types/ipc";

interface WorksTableProps {
  works: WorkListItem[];
  onEdit?: (work: WorkListItem) => void;
  onDelete?: (work: WorkListItem) => void;
  onPaymentStatusChange?: (work: WorkListItem, status: PaymentStatus) => void;
  showActions?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

function cellText(value: string | null | undefined): string {
  return value?.trim() || "—";
}

function formatObservations(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const cleaned = value.replace(/\s*\[stomdental:\d+\]\s*/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || "—";
}

export function WorksTable({
  works,
  onEdit,
  onDelete,
  onPaymentStatusChange,
  showActions = true,
  emptyTitle = "Nicio lucrare încă",
  emptyDescription = "Adaugă prima lucrare cu butonul de mai sus.",
}: WorksTableProps) {
  if (works.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-3 py-3 font-medium whitespace-nowrap">Data</th>
            <th className="px-3 py-3 font-medium">Pacient</th>
            <th className="px-3 py-3 font-medium">Doctor</th>
            <th className="px-3 py-3 font-medium">Lucrare</th>
            <th className="px-3 py-3 font-medium whitespace-nowrap">Tehnician 1</th>
            <th className="px-3 py-3 font-medium whitespace-nowrap">Tehnician 2</th>
            <th className="px-3 py-3 font-medium whitespace-nowrap">Tehnician 3</th>
            <th className="px-3 py-3 font-medium">Observații</th>
            <th className="px-3 py-3 font-medium">Status</th>
            {showActions && <th className="px-3 py-3 font-medium text-right">Acțiuni</th>}
          </tr>
        </thead>
        <tbody>
          {works.map((work) => (
            <tr key={work.id} className="border-b border-border last:border-0 hover:bg-accent/40">
              <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                {formatDate(work.entryDate)}
              </td>
              <td className="px-3 py-3 font-medium text-foreground">{work.patientName}</td>
              <td className="px-3 py-3 text-muted-foreground">{work.doctorName}</td>
              <td
                className="px-3 py-3 text-muted-foreground max-w-[160px] truncate"
                title={work.workSummary}
              >
                {work.workSummary}
              </td>
              <td className="px-3 py-3 text-muted-foreground">{cellText(work.technician1Name)}</td>
              <td className="px-3 py-3 text-muted-foreground">{cellText(work.technician2Name)}</td>
              <td className="px-3 py-3 text-muted-foreground">{cellText(work.technician3Name)}</td>
              <td
                className="px-3 py-3 text-muted-foreground max-w-[180px] truncate"
                title={formatObservations(work.observations)}
              >
                {formatObservations(work.observations)}
              </td>
              <td className="px-3 py-3">
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
                <td className="px-3 py-3">
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
