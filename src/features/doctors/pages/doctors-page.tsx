import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useDoctors } from "../hooks/use-doctors";
import { DoctorsTable } from "../components/doctors-table";
import { DoctorFormDialog } from "../components/doctor-form-dialog";
import { DoctorRatesDialog } from "../components/doctor-rates-dialog";
import { DeleteDoctorDialog } from "../components/delete-doctor-dialog";
import type { DoctorListItem } from "@shared-types/ipc";

export function DoctorsPage() {
  const { data: doctors, isLoading, isError, error } = useDoctors();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingDoctorId, setEditingDoctorId] = React.useState<string | null>(null);
  const [deletingDoctor, setDeletingDoctor] = React.useState<DoctorListItem | null>(null);
  const [ratesDoctor, setRatesDoctor] = React.useState<DoctorListItem | null>(null);

  function openCreateForm() {
    setEditingDoctorId(null);
    setFormOpen(true);
  }

  function openEditForm(doctor: DoctorListItem) {
    setEditingDoctorId(doctor.id);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Doctori</h1>
          <p className="text-sm text-muted-foreground">
            Evidența doctorilor. Deschide tarifele (iconița bani) pentru prețuri per tip lucrare.
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Doctor nou
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca doctorii: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {doctors && (
        <DoctorsTable
          doctors={doctors}
          onEdit={openEditForm}
          onDelete={setDeletingDoctor}
          onRates={setRatesDoctor}
        />
      )}

      <DoctorFormDialog open={formOpen} onOpenChange={setFormOpen} doctorId={editingDoctorId} />
      <DoctorRatesDialog doctor={ratesDoctor} onOpenChange={() => setRatesDoctor(null)} />
      <DeleteDoctorDialog doctor={deletingDoctor} onOpenChange={() => setDeletingDoctor(null)} />
    </div>
  );
}
