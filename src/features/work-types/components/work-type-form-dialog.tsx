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
import { parseRonInput } from "@/shared/lib/format";
import { workTypeFormSchema, type WorkTypeFormValues } from "../types/work-type-schemas";
import { useCreateWorkType, useUpdateWorkType } from "../hooks/use-work-type-mutations";
import type { WorkTypeDto } from "@shared-types/ipc";

interface WorkTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workType?: WorkTypeDto | null;
}

const emptyValues: WorkTypeFormValues = { name: "", doctorPrice: "", technicianPrice: "" };

function baniToInput(bani: number): string {
  return (bani / 100).toFixed(2);
}

export function WorkTypeFormDialog({ open, onOpenChange, workType = null }: WorkTypeFormDialogProps) {
  const isEditMode = workType !== null;
  const createWorkType = useCreateWorkType();
  const updateWorkType = useUpdateWorkType();

  const form = useForm<WorkTypeFormValues>({
    resolver: zodResolver(workTypeFormSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open && workType) {
      form.reset({
        name: workType.name,
        doctorPrice: baniToInput(workType.doctorPrice),
        technicianPrice: baniToInput(workType.technicianPrice),
      });
    } else if (open && !workType) {
      form.reset(emptyValues);
    }
  }, [open, workType, form]);

  async function onSubmit(values: WorkTypeFormValues) {
    const payload = {
      name: values.name,
      doctorPrice: parseRonInput(values.doctorPrice),
      technicianPrice: parseRonInput(values.technicianPrice),
    };

    if (isEditMode && workType) {
      await updateWorkType.mutateAsync({ id: workType.id, ...payload });
    } else {
      await createWorkType.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const isSubmitting = createWorkType.isPending || updateWorkType.isPending;
  const mutationError = createWorkType.error ?? updateWorkType.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează tip lucrare" : "Tip lucrare nou"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualizează numele și prețurile tipului de lucrare."
              : "Definește un tip nou de lucrare cu prețurile implicite."}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doctorPrice">Preț doctor (RON) *</Label>
              <Input id="doctorPrice" placeholder="0.00" {...form.register("doctorPrice")} />
              {form.formState.errors.doctorPrice && (
                <p className="text-xs text-destructive">{form.formState.errors.doctorPrice.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="technicianPrice">Preț tehnician (RON) *</Label>
              <Input id="technicianPrice" placeholder="0.00" {...form.register("technicianPrice")} />
              {form.formState.errors.technicianPrice && (
                <p className="text-xs text-destructive">{form.formState.errors.technicianPrice.message}</p>
              )}
            </div>
          </div>

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
