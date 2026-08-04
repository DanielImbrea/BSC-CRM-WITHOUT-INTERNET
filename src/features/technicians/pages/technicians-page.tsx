import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTechnicians } from "../hooks/use-technicians";
import { TechniciansTable } from "../components/technicians-table";
import { TechnicianFormDialog } from "../components/technician-form-dialog";
import { TechnicianRatesDialog } from "../components/technician-rates-dialog";
import { DeleteTechnicianDialog } from "../components/delete-technician-dialog";
import type { TechnicianDto } from "@shared-types/ipc";

export function TechniciansPage() {
  const { data: technicians, isLoading, isError, error } = useTechnicians();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingTechnician, setEditingTechnician] = React.useState<TechnicianDto | null>(null);
  const [deletingTechnician, setDeletingTechnician] = React.useState<TechnicianDto | null>(null);
  const [ratesTechnician, setRatesTechnician] = React.useState<TechnicianDto | null>(null);

  function openCreateForm() {
    setEditingTechnician(null);
    setFormOpen(true);
  }

  function openEditForm(technician: TechnicianDto) {
    setEditingTechnician(technician);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tehnicieni</h1>
          <p className="text-sm text-muted-foreground">
            Evidența tehnicienilor. Deschide grila (iconița matrice) pentru tarife per doctor și tip
            lucrare.
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Tehnician nou
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca tehnicienii: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {technicians && (
        <TechniciansTable
          technicians={technicians}
          onEdit={openEditForm}
          onDelete={setDeletingTechnician}
          onRates={setRatesTechnician}
        />
      )}

      <TechnicianFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        technician={editingTechnician}
      />
      <TechnicianRatesDialog
        technician={ratesTechnician}
        onOpenChange={() => setRatesTechnician(null)}
      />
      <DeleteTechnicianDialog
        technician={deletingTechnician}
        onOpenChange={() => setDeletingTechnician(null)}
      />
    </div>
  );
}
