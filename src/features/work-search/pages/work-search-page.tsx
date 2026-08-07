import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { MonthPicker } from "@/shared/components/ui/date-picker";
import { FilterEntitySelect } from "@/shared/components/filter-entity-select";
import {
  loadActiveTechnicianOptions,
  loadDoctorOptions,
  loadWorkTypeOptions,
} from "@/shared/lib/catalog-options";
import { useSearchWorks, useUpdateWorkPaymentStatus } from "@/features/works/hooks/use-work-mutations";
import { WorksTable } from "@/features/works/components/works-table";
import { WorkFormDialog } from "@/features/works/components/work-form-dialog";
import { DeleteWorkDialog } from "@/features/works/components/delete-work-dialog";
import { PaymentStatusSelect } from "@/features/works/components/payment-status-select";
import type { PaymentStatus, SearchWorksFilters, WorkListItem } from "@shared-types/ipc";

function buildFilters(state: {
  doctorId: string;
  patientName: string;
  keyword: string;
  technicianId: string;
  technician2Id: string;
  workTypeId: string;
  paymentStatus: PaymentStatus | "";
  month: string;
}): SearchWorksFilters {
  const filters: SearchWorksFilters = {};
  if (state.doctorId) filters.doctorId = state.doctorId;
  if (state.patientName.trim()) filters.patientName = state.patientName.trim();
  if (state.keyword.trim()) filters.keyword = state.keyword.trim();
  if (state.technicianId) filters.technicianId = state.technicianId;
  if (state.technician2Id) filters.technician2Id = state.technician2Id;
  if (state.workTypeId) filters.workTypeId = state.workTypeId;
  if (state.paymentStatus) filters.paymentStatus = state.paymentStatus;
  if (state.month) filters.month = state.month;
  return filters;
}

const loadDoctors = loadDoctorOptions;
const loadTechnicians = loadActiveTechnicianOptions;
const loadWorkTypes = loadWorkTypeOptions;

export function WorkSearchPage() {
  const searchWorks = useSearchWorks();
  const updatePaymentStatus = useUpdateWorkPaymentStatus();

  const [doctorId, setDoctorId] = React.useState("");
  const [patientName, setPatientName] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [technicianId, setTechnicianId] = React.useState("");
  const [technician2Id, setTechnician2Id] = React.useState("");
  const [workTypeId, setWorkTypeId] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus | "">("");
  const [month, setMonth] = React.useState("");
  const [results, setResults] = React.useState<WorkListItem[] | null>(null);
  const [resultsTotal, setResultsTotal] = React.useState<number | null>(null);
  const [resultsTruncated, setResultsTruncated] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingWorkId, setEditingWorkId] = React.useState<string | null>(null);
  const [editingSeed, setEditingSeed] = React.useState<{
    doctorId: string;
    doctorName: string;
    patientName: string;
  } | null>(null);
  const [deletingWork, setDeletingWork] = React.useState<WorkListItem | null>(null);

  const filterState = {
    doctorId,
    patientName,
    keyword,
    technicianId,
    technician2Id,
    workTypeId,
    paymentStatus,
    month,
  };

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const data = await searchWorks.mutateAsync(buildFilters(filterState));
    setResults(data.items);
    setResultsTotal(data.total);
    setResultsTruncated(data.truncated);
  }

  function openEditForm(work: WorkListItem) {
    setEditingWorkId(work.id);
    setEditingSeed({
      doctorId: work.doctorId,
      doctorName: work.doctorName,
      patientName: work.patientName,
    });
    setFormOpen(true);
  }

  function handleWorkSaved() {
    if (results === null) return;
    void searchWorks
      .mutateAsync(buildFilters(filterState))
      .then((data) => {
        setResults(data.items);
        setResultsTotal(data.total);
        setResultsTruncated(data.truncated);
      })
      .catch(() => undefined);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Căutare lucrări</h1>
        <p className="text-sm text-muted-foreground">
          Filtrează după orice criteriu. Perioada e opțională — lasă „Toate perioadele” pentru tot
          istoricul.
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSearch(e)}
        className="rounded-lg border border-border bg-card p-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilterEntitySelect
            label="Doctor"
            value={doctorId}
            onChange={setDoctorId}
            queryKey="doctors"
            loadOptions={loadDoctors}
            placeholder="Toți"
            allLabel="Toți"
            searchPlaceholder="Caută doctor..."
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="patientName">Pacient</Label>
            <Input
              id="patientName"
              placeholder="Nume pacient"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="keyword">Cuvânt cheie</Label>
            <Input
              id="keyword"
              placeholder="Pacient, observații, tip lucrare..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <FilterEntitySelect
            label="Tip lucrare"
            value={workTypeId}
            onChange={setWorkTypeId}
            queryKey="work-types"
            loadOptions={loadWorkTypes}
            placeholder="Toate"
            allLabel="Toate"
            searchPlaceholder="Caută tip lucrare..."
          />

          <div className="flex flex-col gap-1.5">
            <Label>Perioadă (opțional)</Label>
            <MonthPicker allowAll value={month} onChange={setMonth} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <PaymentStatusSelect
              value={paymentStatus}
              onChange={setPaymentStatus}
              allowAll
              placeholder="Toate"
            />
          </div>

          <FilterEntitySelect
            label="Tehnician 1"
            value={technicianId}
            onChange={setTechnicianId}
            queryKey="technicians"
            loadOptions={loadTechnicians}
            searchPlaceholder="Caută tehnician..."
          />

          <FilterEntitySelect
            label="Tehnician 2"
            value={technician2Id}
            onChange={setTechnician2Id}
            queryKey="technicians"
            loadOptions={loadTechnicians}
            searchPlaceholder="Caută tehnician..."
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={searchWorks.isPending} className="gap-2">
            <Search className="h-4 w-4" />
            {searchWorks.isPending ? "Se caută..." : "Caută"}
          </Button>
        </div>

        {searchWorks.error && (
          <p className="mt-3 text-xs text-destructive">
            {searchWorks.error instanceof Error ? searchWorks.error.message : "Eroare la căutare."}
          </p>
        )}
      </form>

      {results !== null && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {resultsTotal !== null
                ? `${resultsTotal.toLocaleString("ro-RO")} ${resultsTotal === 1 ? "rezultat" : "rezultate"}`
                : `${results.length} rezultate`}
              {resultsTruncated && " — afișate primele 500, rafinează filtrele"}
            </p>
          </div>
          <WorksTable
            works={results}
            inlineTechnicianEdit
            onWorkUpdated={(updated) => {
              setResults((current) =>
                current?.map((row) => (row.id === updated.id ? updated : row)) ?? null,
              );
            }}
            onEdit={openEditForm}
            onDelete={setDeletingWork}
            onPaymentStatusChange={(work, status) => {
              void updatePaymentStatus.mutateAsync({ id: work.id, paymentStatus: status }).then(() => {
                setResults((current) =>
                  current?.map((row) => (row.id === work.id ? { ...row, paymentStatus: status } : row)) ?? null,
                );
              });
            }}
            emptyTitle="Niciun rezultat"
            emptyDescription="Încearcă alte filtre sau un cuvânt cheie diferit."
          />
        </div>
      )}

      {formOpen && (
        <WorkFormDialog
          key={editingWorkId ?? "new"}
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setEditingWorkId(null);
              setEditingSeed(null);
              handleWorkSaved();
            }
          }}
          workId={editingWorkId}
          seed={editingSeed}
        />
      )}

      <DeleteWorkDialog
        work={deletingWork}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingWork(null);
            if (results !== null) {
              void searchWorks.mutateAsync(buildFilters(filterState)).then((data) => {
                setResults(data.items);
                setResultsTotal(data.total);
                setResultsTruncated(data.truncated);
              });
            }
          }
        }}
      />
    </div>
  );
}
