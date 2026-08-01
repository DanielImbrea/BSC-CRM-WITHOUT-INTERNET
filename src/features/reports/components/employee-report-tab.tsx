import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ReportDateRangePicker, defaultReportRange } from "./report-date-range-picker";
import { useEmployeeReport } from "../hooks/use-reports";
import { formatMoney } from "@/shared/lib/utils";
import { exportToCsv } from "@/shared/lib/csv";

export function EmployeeReportTab() {
  const [range, setRange] = React.useState(defaultReportRange());
  const { data, isLoading, isError, error } = useEmployeeReport(range);

  function handleExport() {
    if (!data) return;
    exportToCsv(
      `raport-angajati-${range.dateFrom.slice(0, 10)}_${range.dateTo.slice(0, 10)}.csv`,
      ["Angajat", "Nr. salarii", "Total net (RON)"],
      data.map((row) => [row.employeeName, row.entriesCount, (row.totalNet / 100).toFixed(2)]),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <ReportDateRangePicker range={range} onChange={setRange} />
        <Button variant="outline" size="sm" className="gap-2" disabled={!data} onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          Exportă CSV
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca raportul: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Niciun salariu în perioada selectată.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Angajat</th>
                <th className="px-4 py-3 font-medium">Nr. salarii</th>
                <th className="px-4 py-3 font-medium">Total net</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.employeeName} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{row.employeeName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.entriesCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatMoney(row.totalNet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
