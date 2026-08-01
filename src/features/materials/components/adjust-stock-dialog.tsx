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
import { stockAdjustmentSchema, type StockAdjustmentValues } from "../types/material-schemas";
import { useAdjustMaterialStock } from "../hooks/use-material-mutations";
import type { MaterialListItem } from "@shared-types/ipc";

interface AdjustStockDialogProps {
  material: MaterialListItem | null;
  onOpenChange: (open: boolean) => void;
}

export function AdjustStockDialog({ material, onOpenChange }: AdjustStockDialogProps) {
  const adjustStock = useAdjustMaterialStock();
  const form = useForm<StockAdjustmentValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { delta: "" },
  });

  async function onSubmit(values: StockAdjustmentValues) {
    if (!material) return;
    await adjustStock.mutateAsync({ id: material.id, delta: Number(values.delta) });
    form.reset({ delta: "" });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={material !== null}
      onOpenChange={(next) => {
        if (!next) form.reset({ delta: "" });
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustează stocul — {material?.name}</DialogTitle>
          <DialogDescription>
            Stoc curent: {material?.stockQuantity} {material?.unit}. Introdu o valoare pozitivă pentru
            recepție marfă, sau negativă pentru corecție.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delta">Cantitate ({material?.unit})</Label>
            <Input id="delta" autoFocus inputMode="decimal" placeholder="ex: 10 sau -3" {...form.register("delta")} />
            {form.formState.errors.delta && (
              <p className="text-xs text-destructive">{form.formState.errors.delta.message}</p>
            )}
          </div>

          {adjustStock.error && (
            <p className="text-xs text-destructive">
              {adjustStock.error instanceof Error ? adjustStock.error.message : "Eroare necunoscută."}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending ? "Se salvează..." : "Ajustează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
