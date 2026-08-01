import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { WorkStatusBadge } from "@/shared/components/work-status-badge";
import { formatMoney, formatDate } from "@/shared/lib/utils";
import { useWork } from "../hooks/use-works";
import { useUpdateWorkStatus } from "../hooks/use-work-mutations";
import type { WorkStatus } from "@shared-types/ipc";

interface WorkDetailDialogProps {
  workId: string | null;
  onOpenChange: (open: boolean) => void;
}

const statusOptions: { value: WorkStatus; label: string }[] = [
  { value: "IN_PROGRESS", label: "În lucru" },
  { value: "COMPLETED", label: "Finalizată" },
  { value: "CANCELLED", label: "Anulată" },
];

export function WorkDetailDialog({ workId, onOpenChange }: WorkDetailDialogProps) {
  const { data: work, isLoading } = useWork(workId);
  const updateStatus = useUpdateWorkStatus();

  return (
    <Dialog open={workId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

        {work && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>{work.title}</DialogTitle>
                <WorkStatusBadge status={work.status} />
              </div>
              <DialogDescription>
                Client: {work.clientName} · Început la {formatDate(work.startedAt)}
                {work.finishedAt && <> · Finalizat la {formatDate(work.finishedAt)}</>}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={work.status}
                onValueChange={(value) =>
                  void updateStatus.mutateAsync({ id: work.id, status: value as WorkStatus })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Materiale consumate</Label>
              {work.materials.length === 0 && (
                <p className="text-xs text-muted-foreground">Niciun material.</p>
              )}
              {work.materials.map((m) => (
                <div key={m.id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {m.materialName} — {m.quantity} {m.unit}
                  </span>
                  <span className="text-muted-foreground">
                    {formatMoney(Math.round(m.quantity * m.unitCostAtTime))}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Costuri</Label>
              {work.costs.length === 0 && <p className="text-xs text-muted-foreground">Niciun cost.</p>}
              {work.costs.map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {c.description} <span className="text-muted-foreground">({c.category})</span>
                  </span>
                  <span className="text-muted-foreground">{formatMoney(c.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-border pt-3 text-sm font-medium">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatMoney(work.totalCost)}</span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
