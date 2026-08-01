import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteSalary } from "../hooks/use-salary-mutations";
import type { SalaryEntryDto } from "@shared-types/ipc";

interface DeleteSalaryDialogProps {
  salary: SalaryEntryDto | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSalaryDialog({ salary, onOpenChange }: DeleteSalaryDialogProps) {
  const deleteSalary = useDeleteSalary();

  async function handleConfirm() {
    if (!salary) return;
    await deleteSalary.mutateAsync(salary.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={salary !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ștergi salariul lui „{salary?.employeeName}" pentru {salary?.period}?
          </DialogTitle>
          <DialogDescription>
            Acțiunea nu poate fi anulată și este înregistrată în jurnalul de audit.
          </DialogDescription>
        </DialogHeader>

        {deleteSalary.error && (
          <p className="text-xs text-destructive">
            {deleteSalary.error instanceof Error ? deleteSalary.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteSalary.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteSalary.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
