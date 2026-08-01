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
import { salaryFormSchema, type SalaryFormValues } from "../types/salary-schemas";
import { useCreateSalary, useUpdateSalary } from "../hooks/use-salary-mutations";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import { formatMoney } from "@/shared/lib/utils";
import type { SalaryEntryDto } from "@shared-types/ipc";

interface SalaryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salary?: SalaryEntryDto | null;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const emptyValues: SalaryFormValues = {
  employeeId: "",
  period: currentPeriod(),
  baseAmount: "",
  bonuses: "",
  deductions: "",
  paidAt: "",
};

export function SalaryFormDialog({ open, onOpenChange, salary = null }: SalaryFormDialogProps) {
  const isEditMode = salary !== null;
  const { data: employees } = useEmployees();
  const createSalary = useCreateSalary();
  const updateSalary = useUpdateSalary();

  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open && salary) {
      form.reset({
        employeeId: salary.employeeId,
        period: salary.period,
        baseAmount: (salary.baseAmount / 100).toString(),
        bonuses: (salary.bonuses / 100).toString(),
        deductions: (salary.deductions / 100).toString(),
        paidAt: salary.paidAt ? salary.paidAt.slice(0, 10) : "",
      });
    } else if (open && !salary) {
      form.reset(emptyValues);
    }
  }, [open, salary, form]);

  const [base, bonuses, deductions] = form.watch(["baseAmount", "bonuses", "deductions"]);
  const previewNet = (Number(base || 0) + Number(bonuses || 0) - Number(deductions || 0)) * 100;

  async function onSubmit(values: SalaryFormValues) {
    const payload = {
      employeeId: values.employeeId,
      period: values.period,
      baseAmount: Math.round(Number(values.baseAmount) * 100),
      bonuses: Math.round(Number(values.bonuses || 0) * 100),
      deductions: Math.round(Number(values.deductions || 0) * 100),
      paidAt: values.paidAt ? new Date(values.paidAt).toISOString() : undefined,
    };

    if (isEditMode && salary) {
      await updateSalary.mutateAsync({ id: salary.id, ...payload });
    } else {
      await createSalary.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const isSubmitting = createSalary.isPending || updateSalary.isPending;
  const mutationError = createSalary.error ?? updateSalary.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează salariu" : "Salariu nou"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Actualizează salariul pentru această perioadă." : "Înregistrează salariul unui angajat pentru o lună."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Angajat *</Label>
              <Select
                value={form.watch("employeeId")}
                onValueChange={(value) => form.setValue("employeeId", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alege un angajat" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    ?.filter((e) => e.active || e.id === salary?.employeeId)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                        {!employee.active && " (inactiv)"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {form.formState.errors.employeeId && (
                <p className="text-xs text-destructive">{form.formState.errors.employeeId.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="period">Perioadă (AAAA-LL) *</Label>
              <Input id="period" placeholder="2026-08" {...form.register("period")} />
              {form.formState.errors.period && (
                <p className="text-xs text-destructive">{form.formState.errors.period.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="baseAmount">Salariu bază (RON) *</Label>
              <Input id="baseAmount" inputMode="decimal" {...form.register("baseAmount")} />
              {form.formState.errors.baseAmount && (
                <p className="text-xs text-destructive">{form.formState.errors.baseAmount.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bonuses">Bonusuri (RON)</Label>
              <Input id="bonuses" inputMode="decimal" {...form.register("bonuses")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deductions">Deduceri (RON)</Label>
              <Input id="deductions" inputMode="decimal" {...form.register("deductions")} />
            </div>
          </div>
          {form.formState.errors.deductions && (
            <p className="-mt-2 text-xs text-destructive">{form.formState.errors.deductions.message}</p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paidAt">Plătit la data (opțional)</Label>
            <Input id="paidAt" type="date" {...form.register("paidAt")} />
          </div>

          <div className="flex justify-between rounded-md bg-accent/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Salariu net (calculat)</span>
            <span className="font-medium text-foreground">{formatMoney(previewNet)}</span>
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
