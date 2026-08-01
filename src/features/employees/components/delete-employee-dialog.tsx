import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteEmployee } from "../hooks/use-employees";
import type { EmployeeDto } from "@shared-types/ipc";

interface DeleteEmployeeDialogProps {
  employee: EmployeeDto | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEmployeeDialog({ employee, onOpenChange }: DeleteEmployeeDialogProps) {
  const deleteEmployee = useDeleteEmployee();

  async function handleConfirm() {
    if (!employee) return;
    await deleteEmployee.mutateAsync(employee.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={employee !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi angajatul „{employee?.name}"?</DialogTitle>
          <DialogDescription>
            Acțiunea nu poate fi anulată. Dacă angajatul are salarii înregistrate, ștergerea va fi
            respinsă — dezactivează-l în schimb (editează-l și debifează „Activ").
          </DialogDescription>
        </DialogHeader>

        {deleteEmployee.error && (
          <p className="text-xs text-destructive">
            {deleteEmployee.error instanceof Error ? deleteEmployee.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteEmployee.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteEmployee.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
