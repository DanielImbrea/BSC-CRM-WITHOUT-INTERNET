import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteWorkType } from "../hooks/use-work-type-mutations";
import type { WorkTypeDto } from "@shared-types/ipc";

interface DeleteWorkTypeDialogProps {
  workType: WorkTypeDto | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkTypeDialog({ workType, onOpenChange }: DeleteWorkTypeDialogProps) {
  const deleteWorkType = useDeleteWorkType();

  async function handleConfirm() {
    if (!workType) return;
    await deleteWorkType.mutateAsync(workType.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={workType !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi tipul „{workType?.name}"?</DialogTitle>
          <DialogDescription>
            Acțiunea nu poate fi anulată. Tipurile folosite în lucrări existente nu pot fi șterse.
          </DialogDescription>
        </DialogHeader>

        {deleteWorkType.error && (
          <p className="text-xs text-destructive">
            {deleteWorkType.error instanceof Error ? deleteWorkType.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteWorkType.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteWorkType.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
