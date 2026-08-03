import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteWork } from "../hooks/use-work-mutations";
import type { WorkListItem } from "@shared-types/ipc";

interface DeleteWorkDialogProps {
  work: WorkListItem | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkDialog({ work, onOpenChange }: DeleteWorkDialogProps) {
  const deleteWork = useDeleteWork();

  async function handleConfirm() {
    if (!work) return;
    await deleteWork.mutateAsync(work.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={work !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi lucrarea pentru „{work?.patientName}"?</DialogTitle>
          <DialogDescription>Acțiunea nu poate fi anulată.</DialogDescription>
        </DialogHeader>

        {deleteWork.error && (
          <p className="text-xs text-destructive">
            {deleteWork.error instanceof Error ? deleteWork.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteWork.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteWork.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
