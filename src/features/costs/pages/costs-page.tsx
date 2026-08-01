import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useCosts } from "../hooks/use-costs";
import { CostsFilterBar } from "../components/costs-filter-bar";
import { CostsTable } from "../components/costs-table";
import { CostFormDialog } from "../components/cost-form-dialog";
import { DeleteCostDialog } from "../components/delete-cost-dialog";
import type { CostEntryDto, ListCostsFilters } from "@shared-types/ipc";

export function CostsPage() {
  const [filters, setFilters] = React.useState<ListCostsFilters>({});
  const { data: costs, isLoading, isError, error } = useCosts(filters);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingCost, setEditingCost] = React.useState<CostEntryDto | null>(null);
  const [deletingCost, setDeletingCost] = React.useState<CostEntryDto | null>(null);

  function openCreateForm() {
    setEditingCost(null);
    setFormOpen(true);
  }

  function openEditForm(cost: CostEntryDto) {
    setEditingCost(cost);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Costuri</h1>
          <p className="text-sm text-muted-foreground">
            Costuri generale și per-lucrare ale laboratorului.
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Cost nou
        </Button>
      </div>

      <CostsFilterBar filters={filters} onChange={setFilters} />

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca costurile: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {costs && <CostsTable costs={costs} onEdit={openEditForm} onDelete={setDeletingCost} />}

      <CostFormDialog open={formOpen} onOpenChange={setFormOpen} cost={editingCost} />
      <DeleteCostDialog cost={deletingCost} onOpenChange={() => setDeletingCost(null)} />
    </div>
  );
}
