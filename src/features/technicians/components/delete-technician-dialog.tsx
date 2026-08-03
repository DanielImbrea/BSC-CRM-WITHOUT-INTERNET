import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteTechnician } from "../hooks/use-technician-mutations";
import type { TechnicianDto } from "@shared-types/ipc";

interface DeleteTechnicianDialogProps {
  technician: TechnicianDto | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTechnicianDialog({ technician, onOpenChange }: DeleteTechnicianDialogProps) {
  const deleteTechnician = useDeleteTechnician();

  async function handleConfirm() {
    if (!technician) return;
    await deleteTechnician.mutateAsync(technician.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={technician !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi tehnicianul „{technician?.name}"?</DialogTitle>
          <DialogDescription>Acțiunea nu poate fi anulată.</DialogDescription>
        </DialogHeader>

        {deleteTechnician.error && (
          <p className="text-xs text-destructive">
            {deleteTechnician.error instanceof Error ? deleteTechnician.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteTechnician.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteTechnician.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
