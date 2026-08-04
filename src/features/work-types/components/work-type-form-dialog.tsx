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
import { workTypeFormSchema, type WorkTypeFormValues } from "../types/work-type-schemas";
import { useCreateWorkType, useUpdateWorkType } from "../hooks/use-work-type-mutations";
import type { WorkTypeDto } from "@shared-types/ipc";

interface WorkTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workType?: WorkTypeDto | null;
}

const emptyValues: WorkTypeFormValues = { name: "" };

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
      form.reset({ name: workType.name });
    } else if (open && !workType) {
      form.reset(emptyValues);
    }
  }, [open, workType, form]);

  async function onSubmit(values: WorkTypeFormValues) {
    if (isEditMode && workType) {
      await updateWorkType.mutateAsync({ id: workType.id, name: values.name });
    } else {
      await createWorkType.mutateAsync({ name: values.name });
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
              ? "Actualizează numele tipului de lucrare."
              : "Adaugă un tip de lucrare în catalog (ex. MC, MC sinter). Prețurile se configurează separat, per doctor și tehnician."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nume *</Label>
            <Input id="name" autoFocus placeholder="ex. Coroana metalo-ceramică" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
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
