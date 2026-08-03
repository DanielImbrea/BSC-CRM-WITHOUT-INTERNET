import * as React from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { MonthPicker } from "@/shared/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useDoctors } from "@/features/doctors/hooks/use-doctors";
import { useTechnicians } from "@/features/technicians/hooks/use-technicians";
import { useSearchWorks, useUpdateWorkPaymentStatus } from "@/features/works/hooks/use-work-mutations";
import { WorksTable } from "@/features/works/components/works-table";
import { PaymentStatusSelect } from "@/features/works/components/payment-status-select";
import type { PaymentStatus, SearchWorksFilters, WorkListItem } from "@shared-types/ipc";

const NONE = "__none__";

export function WorkSearchPage() {
  const { data: doctors = [] } = useDoctors();
  const { data: technicians = [] } = useTechnicians();
  const searchWorks = useSearchWorks();
  const updatePaymentStatus = useUpdateWorkPaymentStatus();

  const [doctorId, setDoctorId] = React.useState("");
  const [patientName, setPatientName] = React.useState("");
  const [technician1Id, setTechnician1Id] = React.useState("");
  const [technician2Id, setTechnician2Id] = React.useState("");
  const [technician3Id, setTechnician3Id] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus | "">("");
  const [month, setMonth] = React.useState(format(new Date(), "yyyy-MM"));
  const [results, setResults] = React.useState<WorkListItem[] | null>(null);

  const activeTechnicians = technicians.filter((t) => t.active);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const filters: SearchWorksFilters = {};
    if (doctorId) filters.doctorId = doctorId;
    if (patientName.trim()) filters.patientName = patientName.trim();
    if (technician1Id) filters.technician1Id = technician1Id;
    if (technician2Id) filters.technician2Id = technician2Id;
    if (technician3Id) filters.technician3Id = technician3Id;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (month) filters.month = month;

    const data = await searchWorks.mutateAsync(filters);
    setResults(data);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Căutare lucrări</h1>
        <p className="text-sm text-muted-foreground">Filtrează lucrările după criterii multiple.</p>
      </div>

      <form
        onSubmit={(e) => void handleSearch(e)}
        className="rounded-lg border border-border bg-card p-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label>Doctor</Label>
            <Select value={doctorId || NONE} onValueChange={(v) => setDoctorId(v === NONE ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Toți" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Toți</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label>Luna</Label>
            <MonthPicker value={month} onChange={setMonth} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status plată</Label>
            <PaymentStatusSelect
              value={paymentStatus}
              onChange={setPaymentStatus}
              allowAll
              placeholder="Toate"
            />
          </div>

          {([1, 2, 3] as const).map((n) => {
            const value = n === 1 ? technician1Id : n === 2 ? technician2Id : technician3Id;
            const setValue = n === 1 ? setTechnician1Id : n === 2 ? setTechnician2Id : setTechnician3Id;
            return (
              <div key={n} className="flex flex-col gap-1.5">
                <Label>Tehnician {n}</Label>
                <Select value={value || NONE} onValueChange={(v) => setValue(v === NONE ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Oricare" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Oricare</SelectItem>
                    {activeTechnicians.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
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
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "rezultat" : "rezultate"}
          </p>
          <WorksTable
            works={results}
            showActions={false}
            onPaymentStatusChange={(work, status) => {
              void updatePaymentStatus.mutateAsync({ id: work.id, paymentStatus: status }).then(() => {
                setResults((current) =>
                  current?.map((row) => (row.id === work.id ? { ...row, paymentStatus: status } : row)) ?? null,
                );
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
