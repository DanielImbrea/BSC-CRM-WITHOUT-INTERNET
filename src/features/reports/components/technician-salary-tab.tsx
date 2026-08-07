import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { MonthPicker } from "@/shared/components/ui/date-picker";
import { FilterEntitySelect } from "@/shared/components/filter-entity-select";
import { loadActiveTechnicianOptions } from "@/shared/lib/catalog-options";
import { formatDate, formatRon } from "@/shared/lib/format";
import { PaymentStatusSelect } from "@/features/works/components/payment-status-select";
import { useUpdateWorkPaymentStatus } from "@/features/works/hooks/use-work-mutations";
import { useTechnicianSalaryReport } from "../hooks/use-reports";
import { ReportExportButtons } from "./report-export-buttons";
import { ReportPrintLayout } from "./report-print-layout";
import { ReportPrintTable, ReportPrintTd, ReportPrintTh } from "./report-print-table";
import { buildReportPdfFileName } from "../lib/report-file-name";
import { buildTechnicianReportTitle } from "../lib/report-month-label";
import type { PaymentStatus, TechnicianSalaryReport } from "@shared-types/ipc";

const loadTechnicians = loadActiveTechnicianOptions;

export function TechnicianSalaryTab() {
  const reportMutation = useTechnicianSalaryReport();
  const updatePaymentStatus = useUpdateWorkPaymentStatus();

  const [technicianId, setTechnicianId] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus | "">("PLATITA_DOCTOR");
  const [month, setMonth] = React.useState(format(new Date(), "yyyy-MM"));
  const [report, setReport] = React.useState<TechnicianSalaryReport | null>(null);
  const [markingPaid, setMarkingPaid] = React.useState(false);

  const showTechnicianColumn = !technicianId || report?.technicianName === "Toți tehnicienii";

  async function handleGenerate() {
    const data = await reportMutation.mutateAsync({
      technicianId: technicianId || undefined,
      month: month || undefined,
      paymentStatus: paymentStatus || undefined,
    });
    setReport(data);
  }

  async function handleMarkAllPaidToTechnician() {
    if (!report || report.lines.length === 0) return;
    const uniqueWorkIds = [...new Set(report.lines.map((line) => line.workId))];
    const confirmed = window.confirm(
      `Marchezi ${uniqueWorkIds.length} lucrări ca „Plătită tehnician”? Nu vor mai apărea la următorul raport de salariu.`,
    );
    if (!confirmed) return;

    setMarkingPaid(true);
    try {
      for (const workId of uniqueWorkIds) {
        await updatePaymentStatus.mutateAsync({
          id: workId,
          paymentStatus: "PLATITA_TEHNICIAN",
        });
      }
      setReport(null);
      const refreshed = await reportMutation.mutateAsync({
        technicianId: technicianId || undefined,
        month: month || undefined,
        paymentStatus: paymentStatus || undefined,
      });
      setReport(refreshed);
    } finally {
      setMarkingPaid(false);
    }
  }

  const reportTitle = report
    ? buildTechnicianReportTitle(report.month, report.paymentStatus)
    : buildTechnicianReportTitle(month, paymentStatus || undefined);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-5 print:hidden">
        <FilterEntitySelect
          label="Tehnician"
          value={technicianId}
          onChange={setTechnicianId}
          queryKey="technicians-report"
          loadOptions={loadTechnicians}
          placeholder="Toți"
          allLabel="Toți tehnicienii"
          searchPlaceholder="Caută tehnician..."
        />
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <Label>Status plată</Label>
          <PaymentStatusSelect
            value={paymentStatus}
            onChange={setPaymentStatus}
            allowAll
            placeholder="Toate"
          />
        </div>
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <Label>Perioadă</Label>
          <MonthPicker allowAll value={month} onChange={setMonth} />
        </div>
        <Button onClick={() => void handleGenerate()} disabled={reportMutation.isPending}>
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
            {report.lines.length > 0 && technicianId && paymentStatus === "PLATITA_DOCTOR" && (
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
            reportTitle={reportTitle}
          >
            <ReportPrintTable
              isEmpty={report.lines.length === 0}
              emptyMessage="Nicio lucrare pentru criteriile selectate."
              columns={
                <>
                  <ReportPrintTh narrow align="center">
                    {" "}
                  </ReportPrintTh>
                  {showTechnicianColumn && <ReportPrintTh>Tehnician</ReportPrintTh>}
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
                    <ReportPrintTd
                      colSpan={showTechnicianColumn ? 6 : 5}
                      align="right"
                      className="print:hidden"
                    >
                      Total
                    </ReportPrintTd>
                    <ReportPrintTd
                      colSpan={showTechnicianColumn ? 5 : 4}
                      align="right"
                      className="hidden print:table-cell"
                    >
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
                <tr key={`${line.workId}-${line.technicianName}-${line.lineDetail}-${index}`}>
                  <ReportPrintTd narrow align="center" muted>
                    {index + 1}
                  </ReportPrintTd>
                  {showTechnicianColumn && <ReportPrintTd>{line.technicianName}</ReportPrintTd>}
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
