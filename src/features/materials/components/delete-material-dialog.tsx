import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteMaterial } from "../hooks/use-material-mutations";
import type { MaterialListItem } from "@shared-types/ipc";

interface DeleteMaterialDialogProps {
  material: MaterialListItem | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMaterialDialog({ material, onOpenChange }: DeleteMaterialDialogProps) {
  const deleteMaterial = useDeleteMaterial();

  async function handleConfirm() {
    if (!material) return;
    await deleteMaterial.mutateAsync(material.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={material !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi materialul „{material?.name}"?</DialogTitle>
          <DialogDescription>
            Acțiunea nu poate fi anulată. Dacă materialul a fost folosit în orice lucrare, ștergerea
            va fi respinsă pentru a păstra istoricul corect.
          </DialogDescription>
        </DialogHeader>

        {deleteMaterial.error && (
          <p className="text-xs text-destructive">
            {deleteMaterial.error instanceof Error ? deleteMaterial.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMaterial.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteMaterial.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
