import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { employeeFormSchema, type EmployeeFormValues } from "../types/employee-schemas";
import { useCreateEmployee, useUpdateEmployee } from "../hooks/use-employees";
import type { EmployeeDto } from "@shared-types/ipc";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeDto | null;
}

const emptyValues: EmployeeFormValues = { name: "", position: "", active: true };

export function EmployeeFormDialog({ open, onOpenChange, employee = null }: EmployeeFormDialogProps) {
  const isEditMode = employee !== null;
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open && employee) {
      form.reset({ name: employee.name, position: employee.position ?? "", active: employee.active });
    } else if (open && !employee) {
      form.reset(emptyValues);
    }
  }, [open, employee, form]);

  async function onSubmit(values: EmployeeFormValues) {
    if (isEditMode && employee) {
      await updateEmployee.mutateAsync({ id: employee.id, ...values });
    } else {
      await createEmployee.mutateAsync(values);
    }
    onOpenChange(false);
  }

  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;
  const mutationError = createEmployee.error ?? updateEmployee.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează angajat" : "Angajat nou"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Actualizează datele angajatului." : "Adaugă un angajat nou."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nume *</Label>
            <Input id="name" autoFocus {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="position">Funcție</Label>
            <Input id="position" placeholder="ex: tehnician" {...form.register("position")} />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-input" {...form.register("active")} />
            Activ
          </label>

          {mutationError && (
            <p className="text-xs text-destructive">
              {mutationError instanceof Error ? mutationError.message : "Eroare necunoscută."}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
