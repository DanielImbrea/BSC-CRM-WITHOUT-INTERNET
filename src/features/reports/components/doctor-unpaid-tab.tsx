import * as React from "react";
import { Printer } from "lucide-react";
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

  function handlePrint() {
    window.print();
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
          <div className="flex justify-end print:hidden">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Tipărește
            </Button>
          </div>

          <div id="doctor-unpaid-report" className="rounded-lg border border-border bg-card p-6 print:border-0 print:p-0">
            <h2 className="mb-1 text-lg font-semibold text-foreground">{report.doctorName}</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Lucrări neplătite — {report.month}
            </p>

            {report.lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nicio lucrare neplătită în această lună.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Data</th>
                    <th className="py-2 pr-4 font-medium">Pacient</th>
                    <th className="py-2 pr-4 font-medium">Lucrări</th>
                    <th className="py-2 font-medium text-right">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  {report.lines.map((line) => (
                    <tr key={line.workId} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">{formatDate(line.entryDate)}</td>
                      <td className="py-2 pr-4">{line.patientName}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{line.workSummary}</td>
                      <td className="py-2 text-right">{formatRon(line.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td colSpan={3} className="py-3 pr-4 text-right">
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
