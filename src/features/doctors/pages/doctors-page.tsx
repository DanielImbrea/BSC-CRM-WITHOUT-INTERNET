import * as React from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useDoctorsList } from "../hooks/use-doctors";
import { DoctorsTable } from "../components/doctors-table";
import { DoctorFormDialog } from "../components/doctor-form-dialog";
import { DoctorRatesDialog } from "../components/doctor-rates-dialog";
import { DeleteDoctorDialog } from "../components/delete-doctor-dialog";
import type { DoctorListItem } from "@shared-types/ipc";

const PAGE_SIZE = 50;

export function DoctorsPage() {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError, error } = useDoctorsList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingDoctorId, setEditingDoctorId] = React.useState<string | null>(null);
  const [deletingDoctor, setDeletingDoctor] = React.useState<DoctorListItem | null>(null);
  const [ratesDoctor, setRatesDoctor] = React.useState<DoctorListItem | null>(null);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Doctori</h1>
          <p className="text-sm text-muted-foreground">
            Evidența doctorilor. Deschide tarifele (iconița bani) pentru prețuri per tip lucrare.
            Caută după nume, telefon sau email.
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Doctor nou
        </Button>
      </div>

      <form
        onSubmit={(e) => handleSearchSubmit(e)}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
      >
        <div className="flex min-w-[240px] flex-1 flex-col gap-1.5">
          <Label htmlFor="doctorSearch">Caută doctor</Label>
          <Input
            id="doctorSearch"
            placeholder="ex. Popescu, 0721..., email@..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Caută
        </Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
          >
            Resetează
          </Button>
        )}
        {data && (
          <p className="w-full text-sm text-muted-foreground sm:w-auto sm:pb-2">
            {data.total.toLocaleString("ro-RO")} {data.total === 1 ? "doctor" : "doctori"}
            {search ? ` pentru „${search}"` : ""}
          </p>
        )}
      </form>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca doctorii: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {data && (
        <>
          <DoctorsTable
            doctors={data.items}
            onEdit={openEditForm}
            onDelete={setDeletingDoctor}
            onRates={setRatesDoctor}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Pagina {data.page} din {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Înapoi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1"
                >
                  Înainte
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <DoctorFormDialog open={formOpen} onOpenChange={setFormOpen} doctorId={editingDoctorId} />
      <DoctorRatesDialog doctor={ratesDoctor} onOpenChange={() => setRatesDoctor(null)} />
      <DeleteDoctorDialog doctor={deletingDoctor} onOpenChange={() => setDeletingDoctor(null)} />
    </div>
  );
}
