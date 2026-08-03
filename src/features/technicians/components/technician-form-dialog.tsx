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
import { technicianFormSchema, type TechnicianFormValues } from "../types/technician-schemas";
import { useCreateTechnician, useUpdateTechnician } from "../hooks/use-technician-mutations";
import type { TechnicianDto } from "@shared-types/ipc";

interface TechnicianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technician?: TechnicianDto | null;
}

const emptyValues: TechnicianFormValues = { name: "", active: true };

export function TechnicianFormDialog({ open, onOpenChange, technician = null }: TechnicianFormDialogProps) {
  const isEditMode = technician !== null;
  const createTechnician = useCreateTechnician();
  const updateTechnician = useUpdateTechnician();

  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(technicianFormSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open && technician) {
      form.reset({ name: technician.name, active: technician.active });
    } else if (open && !technician) {
      form.reset(emptyValues);
    }
  }, [open, technician, form]);

  async function onSubmit(values: TechnicianFormValues) {
    if (isEditMode && technician) {
      await updateTechnician.mutateAsync({ id: technician.id, ...values });
    } else {
      await createTechnician.mutateAsync(values);
    }
    onOpenChange(false);
  }

  const isSubmitting = createTechnician.isPending || updateTechnician.isPending;
  const mutationError = createTechnician.error ?? updateTechnician.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează tehnician" : "Tehnician nou"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Actualizează datele tehnicianului." : "Adaugă un tehnician nou."}
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
