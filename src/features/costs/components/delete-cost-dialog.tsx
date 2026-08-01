import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteCost } from "../hooks/use-cost-mutations";
import type { CostEntryDto } from "@shared-types/ipc";

interface DeleteCostDialogProps {
  cost: CostEntryDto | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCostDialog({ cost, onOpenChange }: DeleteCostDialogProps) {
  const deleteCost = useDeleteCost();

  async function handleConfirm() {
    if (!cost) return;
    await deleteCost.mutateAsync(cost.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={cost !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi costul „{cost?.description}"?</DialogTitle>
          <DialogDescription>Acțiunea nu poate fi anulată.</DialogDescription>
        </DialogHeader>

        {deleteCost.error && (
          <p className="text-xs text-destructive">
            {deleteCost.error instanceof Error ? deleteCost.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteCost.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteCost.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
