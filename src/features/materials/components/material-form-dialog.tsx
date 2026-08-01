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
import { materialFormSchema, type MaterialFormValues } from "../types/material-schemas";
import { useCreateMaterial, useUpdateMaterial } from "../hooks/use-material-mutations";
import type { MaterialListItem } from "@shared-types/ipc";

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dacă e prezent, dialogul editează acest material; altfel creează unul nou. */
  material?: MaterialListItem | null;
}

const emptyValues: MaterialFormValues = { name: "", unit: "", unitCost: "", minStockQuantity: "" };

export function MaterialFormDialog({ open, onOpenChange, material = null }: MaterialFormDialogProps) {
  const isEditMode = material !== null;
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open && material) {
      form.reset({
        name: material.name,
        unit: material.unit,
        unitCost: (material.unitCost / 100).toString(),
        minStockQuantity: material.minStockQuantity.toString(),
      });
    } else if (open && !material) {
      form.reset(emptyValues);
    }
  }, [open, material, form]);

  async function onSubmit(values: MaterialFormValues) {
    const payload = {
      name: values.name,
      unit: values.unit,
      unitCost: Math.round(Number(values.unitCost) * 100),
      minStockQuantity: values.minStockQuantity ? Number(values.minStockQuantity) : undefined,
    };

    if (isEditMode && material) {
      await updateMaterial.mutateAsync({ id: material.id, ...payload });
    } else {
      await createMaterial.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const isSubmitting = createMaterial.isPending || updateMaterial.isPending;
  const mutationError = createMaterial.error ?? updateMaterial.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează material" : "Material nou"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualizează datele materialului."
              : "Adaugă un material nou în evidența laboratorului."}
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
              <Label htmlFor="unit">Unitate de măsură *</Label>
              <Input id="unit" placeholder="ex: buc, ml, kg" {...form.register("unit")} />
              {form.formState.errors.unit && (
                <p className="text-xs text-destructive">{form.formState.errors.unit.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unitCost">Cost unitar (RON) *</Label>
              <Input id="unitCost" inputMode="decimal" {...form.register("unitCost")} />
              {form.formState.errors.unitCost && (
                <p className="text-xs text-destructive">{form.formState.errors.unitCost.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="minStockQuantity">Prag minim de stoc</Label>
            <Input id="minStockQuantity" inputMode="decimal" {...form.register("minStockQuantity")} />
            <p className="text-xs text-muted-foreground">
              Sub acest nivel, materialul apare marcat ca „stoc redus" în listă.
            </p>
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
