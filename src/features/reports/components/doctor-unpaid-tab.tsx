import * as React from "react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { MonthPicker, DatePicker } from "@/shared/components/ui/date-picker";
import { FilterEntitySelect } from "@/shared/components/filter-entity-select";
import { loadDoctorOptions } from "@/shared/lib/catalog-options";
import { formatDate, formatRon } from "@/shared/lib/format";
import { PaymentStatusSelect } from "@/features/works/components/payment-status-select";
import { useDoctorUnpaidReport } from "../hooks/use-reports";
import { ReportExportButtons } from "./report-export-buttons";
import { ReportPrintLayout } from "./report-print-layout";
import { ReportPrintTable, ReportPrintTd, ReportPrintTh } from "./report-print-table";
import { buildReportPdfFileName } from "../lib/report-file-name";
import { buildDoctorReportTitle } from "../lib/report-month-label";
import type { DoctorUnpaidReport, PaymentStatus } from "@shared-types/ipc";

const loadDoctors = loadDoctorOptions;

function formatPaymentDueDate(isoDate: string): string {
  return format(parseISO(isoDate), "d MMMM yyyy", { locale: ro });
}

export function DoctorUnpaidTab() {
  const reportMutation = useDoctorUnpaidReport();

  const [doctorId, setDoctorId] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus | "">("NEPLATITA");
  const [month, setMonth] = React.useState(format(new Date(), "yyyy-MM"));
  const [paymentDueDate, setPaymentDueDate] = React.useState("");
  const [report, setReport] = React.useState<DoctorUnpaidReport | null>(null);

  const showDoctorColumn = !doctorId || report?.doctorName === "Toți doctorii";

  async function handleGenerate() {
    const data = await reportMutation.mutateAsync({
      doctorId: doctorId || undefined,
      month: month || undefined,
      paymentStatus: paymentStatus || undefined,
    });
    setReport(data);
  }

  const reportTitle = report
    ? buildDoctorReportTitle(report.month, report.paymentStatus)
    : buildDoctorReportTitle(month, paymentStatus || undefined);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-5 print:hidden">
        <FilterEntitySelect
          label="Doctor"
          value={doctorId}
          onChange={setDoctorId}
          queryKey="doctors-report"
          loadOptions={loadDoctors}
          placeholder="Toți"
          allLabel="Toți doctorii"
          searchPlaceholder="Caută doctor..."
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
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <Label>Termen plată (opțional)</Label>
          <DatePicker
            value={paymentDueDate}
            onChange={setPaymentDueDate}
            placeholder="Alege data"
          />
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
            pdfFileName={buildReportPdfFileName(
              "raport-doctor",
              report.doctorName,
              report.month || "toate",
            )}
          />

          <ReportPrintLayout id="doctor-unpaid-report" personName={report.doctorName} reportTitle={reportTitle}>
            {paymentDueDate && (
              <p className="mb-4 text-sm font-medium text-foreground print:mb-3 print:text-black">
                Termen plată: {formatPaymentDueDate(paymentDueDate)}
              </p>
            )}
            <ReportPrintTable
              isEmpty={report.lines.length === 0}
              emptyMessage="Nicio lucrare pentru criteriile selectate."
              columns={
                <>
                  <ReportPrintTh narrow align="center">
                    {" "}
                  </ReportPrintTh>
                  {showDoctorColumn && <ReportPrintTh>Doctor</ReportPrintTh>}
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
                      colSpan={showDoctorColumn ? 5 : 4}
                      align="right"
                      className="print:hidden"
                    >
                      Total
                    </ReportPrintTd>
                    <ReportPrintTd
                      colSpan={showDoctorColumn ? 4 : 3}
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
                <tr key={line.workId}>
                  <ReportPrintTd narrow align="center" muted>
                    {index + 1}
                  </ReportPrintTd>
                  {showDoctorColumn && <ReportPrintTd>{line.doctorName}</ReportPrintTd>}
                  <ReportPrintTd className="print:hidden" muted>
                    {formatDate(line.entryDate)}
                  </ReportPrintTd>
                  <ReportPrintTd>{line.patientName}</ReportPrintTd>
                  <ReportPrintTd muted>{line.workSummary}</ReportPrintTd>
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
