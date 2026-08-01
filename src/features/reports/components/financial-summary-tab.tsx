import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { ReportDateRangePicker, defaultReportRange } from "./report-date-range-picker";
import { useFinancialSummaryReport } from "../hooks/use-reports";
import { formatMoney } from "@/shared/lib/utils";
import { exportToCsv } from "@/shared/lib/csv";

export function FinancialSummaryTab() {
  const [range, setRange] = React.useState(defaultReportRange());
  const { data, isLoading, isError, error } = useFinancialSummaryReport(range);

  function handleExport() {
    if (!data) return;
    exportToCsv(
      `raport-financiar-${range.dateFrom.slice(0, 10)}_${range.dateTo.slice(0, 10)}.csv`,
      ["Categorie", "Sumă (RON)"],
      data.costsByCategory.map((c) => [c.category, (c.amount / 100).toFixed(2)]),
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

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Costuri totale</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-semibold text-foreground">
                {formatMoney(data.totalCosts)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Salarii nete totale</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-semibold text-foreground">
                {formatMoney(data.totalSalaries)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Lucrări finalizate</CardTitle>
              </CardHeader>
              <CardContent className="text-xl font-semibold text-foreground">
                {data.completedWorksCount}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Costuri pe categorii</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {data.costsByCategory.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Niciun cost în perioada selectată.
                </p>
              )}
              {data.costsByCategory.map((c) => (
                <div key={c.category} className="flex justify-between py-1.5 text-sm">
                  <span className="text-foreground">{c.category}</span>
                  <span className="text-muted-foreground">{formatMoney(c.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
