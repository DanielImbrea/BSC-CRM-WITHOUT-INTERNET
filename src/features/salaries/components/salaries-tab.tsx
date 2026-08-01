import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useSalaries } from "../hooks/use-salaries";
import { SalariesTable } from "../components/salaries-table";
import { SalaryFormDialog } from "../components/salary-form-dialog";
import { DeleteSalaryDialog } from "../components/delete-salary-dialog";
import type { SalaryEntryDto } from "@shared-types/ipc";

export function SalariesTab() {
  const [period, setPeriod] = React.useState("");
  const { data: salaries, isLoading, isError, error } = useSalaries({ period: period || undefined });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingSalary, setEditingSalary] = React.useState<SalaryEntryDto | null>(null);
  const [deletingSalary, setDeletingSalary] = React.useState<SalaryEntryDto | null>(null);

  function openCreateForm() {
    setEditingSalary(null);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="periodFilter">Filtrează după perioadă</Label>
          <Input
            id="periodFilter"
            placeholder="ex: 2026-08"
            className="w-40"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Salariu nou
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca salariile: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {salaries && (
        <SalariesTable
          salaries={salaries}
          onEdit={(s) => {
            setEditingSalary(s);
            setFormOpen(true);
          }}
          onDelete={setDeletingSalary}
        />
      )}

      <SalaryFormDialog open={formOpen} onOpenChange={setFormOpen} salary={editingSalary} />
      <DeleteSalaryDialog salary={deletingSalary} onOpenChange={() => setDeletingSalary(null)} />
    </div>
  );
}
