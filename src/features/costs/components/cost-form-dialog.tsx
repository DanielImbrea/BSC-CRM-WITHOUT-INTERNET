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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { costFormSchema, type CostFormValues } from "../types/cost-schemas";
import { useCreateCost, useUpdateCost } from "../hooks/use-cost-mutations";
import { useWorks } from "@/features/works/hooks/use-works";
import type { CostEntryDto } from "@shared-types/ipc";

interface CostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cost?: CostEntryDto | null;
}

const NO_WORK = "__none__";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyValues: CostFormValues = {
  description: "",
  amount: "",
  category: "",
  date: todayIso(),
  workId: undefined,
};

export function CostFormDialog({ open, onOpenChange, cost = null }: CostFormDialogProps) {
  const isEditMode = cost !== null;
  const { data: works } = useWorks();
  const createCost = useCreateCost();
  const updateCost = useUpdateCost();

  const form = useForm<CostFormValues>({
    resolver: zodResolver(costFormSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open && cost) {
      form.reset({
        description: cost.description,
        amount: (cost.amount / 100).toString(),
        category: cost.category,
        date: cost.date.slice(0, 10),
        workId: cost.workId ?? undefined,
      });
    } else if (open && !cost) {
      form.reset(emptyValues);
    }
  }, [open, cost, form]);

  async function onSubmit(values: CostFormValues) {
    const payload = {
      description: values.description,
      amount: Math.round(Number(values.amount) * 100),
      category: values.category,
      date: new Date(values.date).toISOString(),
      workId: values.workId,
    };

    if (isEditMode && cost) {
      await updateCost.mutateAsync({ id: cost.id, ...payload });
    } else {
      await createCost.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const isSubmitting = createCost.isPending || updateCost.isPending;
  const mutationError = createCost.error ?? updateCost.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează cost" : "Cost nou"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualizează detaliile costului."
              : "Adaugă un cost general sau legat de o lucrare existentă."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descriere *</Label>
            <Input id="description" autoFocus {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categorie *</Label>
              <Input id="category" placeholder="ex: chirie" {...form.register("category")} />
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Sumă (RON) *</Label>
              <Input id="amount" inputMode="decimal" {...form.register("amount")} />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Lucrare asociată (opțional)</Label>
            <Select
              value={form.watch("workId") ?? NO_WORK}
              onValueChange={(value) =>
                form.setValue("workId", value === NO_WORK ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cost general (fără lucrare)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_WORK}>Cost general (fără lucrare)</SelectItem>
                {works?.map((work) => (
                  <SelectItem key={work.id} value={work.id}>
                    {work.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
