import * as React from "react";
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
import { useDoctors } from "@/features/doctors/hooks/use-doctors";
import { useDoctorUnpaidReport } from "../hooks/use-reports";
import { ReportExportButtons } from "./report-export-buttons";
import { ReportPrintLayout } from "./report-print-layout";
import { ReportPrintTable, ReportPrintTd, ReportPrintTh } from "./report-print-table";
import { buildReportPdfFileName } from "../lib/report-file-name";
import { formatReportMonthLabel } from "../lib/report-month-label";
import type { DoctorUnpaidReport } from "@shared-types/ipc";

export function DoctorUnpaidTab() {
  const { data: doctors = [] } = useDoctors();
  const reportMutation = useDoctorUnpaidReport();

  const [doctorId, setDoctorId] = React.useState("");
  const [month, setMonth] = React.useState(format(new Date(), "yyyy-MM"));
  const [report, setReport] = React.useState<DoctorUnpaidReport | null>(null);

  async function handleGenerate() {
    if (!doctorId) return;
    const data = await reportMutation.mutateAsync({ doctorId, month });
    setReport(data);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-5 print:hidden">
        <div className="flex min-w-[200px] flex-col gap-1.5">
          <Label>Doctor *</Label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <Label>Luna</Label>
          <MonthPicker value={month} onChange={setMonth} />
        </div>
        <Button onClick={() => void handleGenerate()} disabled={!doctorId || reportMutation.isPending}>
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
            pdfFileName={buildReportPdfFileName("raport-neplatite", report.doctorName, report.month)}
          />

          <ReportPrintLayout
            id="doctor-unpaid-report"
            personName={report.doctorName}
            reportTitle={`Lucrări neplătite — ${formatReportMonthLabel(report.month)}`}
          >
            <ReportPrintTable
              isEmpty={report.lines.length === 0}
              emptyMessage="Nicio lucrare neplătită în această lună."
              columns={
                <>
                  <ReportPrintTh narrow align="center">
                    {" "}
                  </ReportPrintTh>
                  <ReportPrintTh>Doctor</ReportPrintTh>
                  <ReportPrintTh>Data intrare</ReportPrintTh>
                  <ReportPrintTh>Pacient</ReportPrintTh>
                  <ReportPrintTh>Lucrări</ReportPrintTh>
                  <ReportPrintTh align="right">Sumă</ReportPrintTh>
                </>
              }
              totalLabel={
                report.lines.length > 0 ? (
                  <ReportPrintTd colSpan={5} align="right">
                    Total
                  </ReportPrintTd>
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
                  <ReportPrintTd>{report.doctorName}</ReportPrintTd>
                  <ReportPrintTd muted>{formatDate(line.entryDate)}</ReportPrintTd>
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
