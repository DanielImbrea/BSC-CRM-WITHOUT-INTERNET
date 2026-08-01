import { cn } from "@/shared/lib/utils";
import type { WorkStatus } from "@shared-types/ipc";

const statusLabels: Record<WorkStatus, string> = {
  IN_PROGRESS: "În lucru",
  COMPLETED: "Finalizată",
  CANCELLED: "Anulată",
};

const statusClasses: Record<WorkStatus, string> = {
  IN_PROGRESS: "text-amber-400 bg-amber-400/10",
  COMPLETED: "text-emerald-400 bg-emerald-400/10",
  CANCELLED: "text-muted-foreground bg-muted",
};

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusClasses[status])}>
      {statusLabels[status]}
    </span>
  );
}
