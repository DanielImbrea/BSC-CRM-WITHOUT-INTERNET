import * as React from "react";
import { CheckCircle2 } from "lucide-react";
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
import { ReportExportButtons } from "./report-export-buttons";
import { ReportPrintLayout } from "./report-print-layout";
import { ReportPrintTable, ReportPrintTd, ReportPrintTh } from "./report-print-table";
import { buildReportPdfFileName } from "../lib/report-file-name";
import { formatReportMonthLabel } from "../lib/report-month-label";
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
          <ReportExportButtons
            pdfFileName={buildReportPdfFileName("raport-salariu", report.technicianName, report.month)}
          >
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
          </ReportExportButtons>

          <p className="text-xs text-muted-foreground print:hidden">
            După ce ai tipărit foaia și i-ai dat banii tehnicianului, apasă butonul de mai sus ca
            lucrările să nu mai apară la următorul raport.
          </p>

          <ReportPrintLayout
            id="technician-salary-report"
            personName={report.technicianName}
            reportTitle={`Salariu tehnician — ${formatReportMonthLabel(report.month)}`}
          >
            <ReportPrintTable
              isEmpty={report.lines.length === 0}
              emptyMessage="Nicio lucrare în această lună."
              columns={
                <>
                  <ReportPrintTh narrow align="center">
                    {" "}
                  </ReportPrintTh>
                  <ReportPrintTh>Doctor</ReportPrintTh>
                  <ReportPrintTh className="print:hidden">Data intrare</ReportPrintTh>
                  <ReportPrintTh>Pacient</ReportPrintTh>
                  <ReportPrintTh>Lucrări</ReportPrintTh>
                  <ReportPrintTh align="right">Sumă</ReportPrintTh>
                </>
              }
              totalLabel={
                report.lines.length > 0 ? (
                  <>
                    <ReportPrintTd colSpan={5} align="right" className="print:hidden">
                      Total
                    </ReportPrintTd>
                    <ReportPrintTd colSpan={4} align="right" className="hidden print:table-cell">
                      Total
                    </ReportPrintTd>
                  </>
                ) : undefined
              }
              totalValue={
                report.lines.length > 0 ? (
                  <ReportPrintTd align="right">{formatRon(report.totalAmount)}</ReportPrintTd>
                ) : undefined
              }
            >
              {report.lines.map((line, index) => (
                <tr key={`${line.workId}-${line.lineDetail}-${index}`}>
                  <ReportPrintTd narrow align="center" muted>
                    {index + 1}
                  </ReportPrintTd>
                  <ReportPrintTd>{line.doctorName}</ReportPrintTd>
                  <ReportPrintTd className="print:hidden" muted>
                    {formatDate(line.entryDate)}
                  </ReportPrintTd>
                  <ReportPrintTd>{line.patientName}</ReportPrintTd>
                  <ReportPrintTd muted>{line.lineDetail || line.workSummary}</ReportPrintTd>
                  <ReportPrintTd align="right">{formatRon(line.amount)}</ReportPrintTd>
                </tr>
              ))}
            </ReportPrintTable>
          </ReportPrintLayout>
        </div>
      )}
    </div>
  );
}
