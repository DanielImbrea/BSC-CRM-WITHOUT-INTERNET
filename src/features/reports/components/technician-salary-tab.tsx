import * as React from "react";
import { Printer, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { MonthPicker } from "@/shared/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { formatDate, formatRon } from "@/shared/lib/format";
import { useTechnicians } from "@/features/technicians/hooks/use-technicians";
import { useUpdateWorkPaymentStatus } from "@/features/works/hooks/use-work-mutations";
import { useTechnicianSalaryReport } from "../hooks/use-reports";
import type { TechnicianSalaryReport } from "@shared-types/ipc";

export function TechnicianSalaryTab() {
  const { data: technicians = [] } = useTechnicians();
  const reportMutation = useTechnicianSalaryReport();
  const updatePaymentStatus = useUpdateWorkPaymentStatus();

  const [technicianId, setTechnicianId] = React.useState("");
  const [month, setMonth] = React.useState(format(new Date(), "yyyy-MM"));
  const [report, setReport] = React.useState<TechnicianSalaryReport | null>(null);
  const [markingPaid, setMarkingPaid] = React.useState(false);

  const activeTechnicians = technicians.filter((t) => t.active);

  async function handleGenerate() {
    if (!technicianId) return;
    const data = await reportMutation.mutateAsync({ technicianId, month });
    setReport(data);
  }

  function handlePrint() {
    window.print();
  }

  async function handleMarkAllPaidToTechnician() {
    if (!report || report.lines.length === 0) return;
    const confirmed = window.confirm(
      `Marchezi ${report.lines.length} lucrări ca „Plătită tehnician”? Nu vor mai apărea la următorul raport de salariu.`,
    );
    if (!confirmed) return;

    setMarkingPaid(true);
    try {
      for (const line of report.lines) {
        await updatePaymentStatus.mutateAsync({
          id: line.workId,
          paymentStatus: "PLATITA_TEHNICIAN",
        });
      }
      setReport(null);
      if (technicianId) {
        const refreshed = await reportMutation.mutateAsync({ technicianId, month });
        setReport(refreshed);
      }
    } finally {
      setMarkingPaid(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-5 print:hidden">
        <div className="flex min-w-[200px] flex-col gap-1.5">
          <Label>Tehnician *</Label>
          <Select value={technicianId} onValueChange={setTechnicianId}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează tehnician" />
            </SelectTrigger>
            <SelectContent>
              {activeTechnicians.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <Label>Luna</Label>
          <MonthPicker value={month} onChange={setMonth} />
        </div>
        <Button
          onClick={() => void handleGenerate()}
          disabled={!technicianId || reportMutation.isPending}
        >
          {reportMutation.isPending ? "Se generează..." : "Generează"}
        </Button>
      </div>

      {reportMutation.error && (
        <p className="text-sm text-destructive print:hidden">
          {reportMutation.error instanceof Error ? reportMutation.error.message : "Eroare la generare."}
        </p>
      )}

      {report && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-2 print:hidden">
            {report.lines.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => void handleMarkAllPaidToTechnician()}
                disabled={markingPaid}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {markingPaid ? "Se marchează..." : "Marchează ca plătite tehnicianului"}
              </Button>
            )}
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Tipărește
            </Button>
          </div>

          <p className="text-xs text-muted-foreground print:hidden">
            După ce ai tipărit foaia și i-ai dat banii tehnicianului, apasă butonul de mai sus ca
            lucrările să nu mai apară la următorul raport.
          </p>

          <div id="technician-salary-report" className="rounded-lg border border-border bg-card p-6 print:border-0 print:p-0">
            <h2 className="mb-1 text-lg font-semibold text-foreground">{report.technicianName}</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Salariu tehnician — {report.month}
            </p>

            {report.lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nicio lucrare în această lună.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Data</th>
                    <th className="py-2 pr-4 font-medium">Pacient</th>
                    <th className="py-2 pr-4 font-medium">Doctor</th>
                    <th className="py-2 pr-4 font-medium">Lucrări</th>
                    <th className="py-2 font-medium text-right">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  {report.lines.map((line) => (
                    <tr key={line.workId} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">{formatDate(line.entryDate)}</td>
                      <td className="py-2 pr-4">{line.patientName}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{line.doctorName}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{line.workSummary}</td>
                      <td className="py-2 text-right">{formatRon(line.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td colSpan={4} className="py-3 pr-4 text-right">
                      Total
                    </td>
                    <td className="py-3 text-right">{formatRon(report.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
