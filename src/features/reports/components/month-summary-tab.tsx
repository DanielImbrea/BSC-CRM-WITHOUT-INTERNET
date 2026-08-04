import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { MonthPicker } from "@/shared/components/ui/date-picker";
import { formatRon } from "@/shared/lib/format";
import { useMonthSummaryReport } from "../hooks/use-reports";
import { ReportExportButtons } from "./report-export-buttons";
import { ReportPrintLayout } from "./report-print-layout";
import { buildReportPdfFileName } from "../lib/report-file-name";
import { formatReportMonthLabel } from "../lib/report-month-label";
import type { MonthSummaryReport } from "@shared-types/ipc";

function SummaryStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="report-summary-stat rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

export function MonthSummaryTab() {
  const reportMutation = useMonthSummaryReport();
  const [month, setMonth] = React.useState(format(new Date(), "yyyy-MM"));
  const [report, setReport] = React.useState<MonthSummaryReport | null>(null);

  async function handleGenerate() {
    const data = await reportMutation.mutateAsync({ month });
    setReport(data);
  }

  const monthLabel = formatReportMonthLabel(month);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-5 print:hidden">
        <div className="flex min-w-[180px] flex-col gap-1.5">
          <Label>Luna</Label>
          <MonthPicker value={month} onChange={setMonth} />
        </div>
        <Button onClick={() => void handleGenerate()} disabled={reportMutation.isPending}>
          {reportMutation.isPending ? "Se generează..." : "Generează"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground print:hidden">
        Rezumat intern la sfârșit de lună: cât ai încasat de la doctori și cât ai achitat tehnicienilor
        pentru lucrările din luna selectată (după data intrării).
      </p>

      {reportMutation.error && (
        <p className="text-sm text-destructive print:hidden">
          {reportMutation.error instanceof Error ? reportMutation.error.message : "Eroare la generare."}
        </p>
      )}

      {report && (
        <div className="flex flex-col gap-4">
          <ReportExportButtons
            pdfFileName={buildReportPdfFileName("rezumat-luna", monthLabel, report.month)}
          />

          <ReportPrintLayout
            id="month-summary-report"
            personName="Rezumat lunar"
            reportTitle={monthLabel}
          >
            <div className="report-summary-grid grid gap-4 sm:grid-cols-2">
              <SummaryStat
                label="Încasat de la doctori"
                value={formatRon(report.doctorPaidTotal)}
                detail={`${report.doctorPaidWorksCount} lucrări (Plătită doctor / Plătită tehnician)`}
              />
              <SummaryStat
                label="Achitat tehnicienilor"
                value={formatRon(report.technicianPaidTotal)}
                detail={`${report.technicianPaidWorksCount} lucrări (Plătită tehnician)`}
              />
            </div>
          </ReportPrintLayout>
        </div>
      )}
    </div>
  );
}
