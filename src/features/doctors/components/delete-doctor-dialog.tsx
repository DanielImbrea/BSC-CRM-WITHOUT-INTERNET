import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteDoctor } from "../hooks/use-doctor-mutations";
import type { DoctorListItem } from "@shared-types/ipc";

interface DeleteDoctorDialogProps {
  doctor: DoctorListItem | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDoctorDialog({ doctor, onOpenChange }: DeleteDoctorDialogProps) {
  const deleteDoctor = useDeleteDoctor();

  async function handleConfirm() {
    if (!doctor) return;
    await deleteDoctor.mutateAsync(doctor.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={doctor !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi doctorul „{doctor?.name}"?</DialogTitle>
          <DialogDescription>
            Acțiunea nu poate fi anulată.
            {doctor && doctor.worksCount > 0 && (
              <>
                {" "}
                Acest doctor are {doctor.worksCount}{" "}
                {doctor.worksCount === 1 ? "lucrare asociată" : "lucrări asociate"} — ștergerea va
                fi respinsă până când lucrările sunt reasignate sau șterse.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {deleteDoctor.error && (
          <p className="text-xs text-destructive">
            {deleteDoctor.error instanceof Error ? deleteDoctor.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteDoctor.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteDoctor.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
