import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatMoney, formatDate } from "@/shared/lib/utils";
import type { SalaryEntryDto } from "@shared-types/ipc";

interface SalariesTableProps {
  salaries: SalaryEntryDto[];
  onEdit: (salary: SalaryEntryDto) => void;
  onDelete: (salary: SalaryEntryDto) => void;
}

export function SalariesTable({ salaries, onEdit, onDelete }: SalariesTableProps) {
  if (salaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Niciun salariu înregistrat</p>
        <p className="text-sm text-muted-foreground">Adaugă primul salariu cu butonul de mai sus.</p>
      </div>
    );
  }

  const totalNet = salaries.reduce((sum, s) => sum + s.netAmount, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Angajat</th>
            <th className="px-4 py-3 font-medium">Perioadă</th>
            <th className="px-4 py-3 font-medium">Bază</th>
            <th className="px-4 py-3 font-medium">Bonusuri</th>
            <th className="px-4 py-3 font-medium">Deduceri</th>
            <th className="px-4 py-3 font-medium">Net</th>
            <th className="px-4 py-3 font-medium">Plătit la</th>
            <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((salary) => (
            <tr key={salary.id} className="border-b border-border last:border-0 hover:bg-accent/40">
              <td className="px-4 py-3 font-medium text-foreground">{salary.employeeName}</td>
              <td className="px-4 py-3 text-muted-foreground">{salary.period}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatMoney(salary.baseAmount)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatMoney(salary.bonuses)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatMoney(salary.deductions)}</td>
              <td className="px-4 py-3 font-medium text-foreground">{formatMoney(salary.netAmount)}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {salary.paidAt ? formatDate(salary.paidAt) : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(salary)} aria-label="Editează">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(salary)} aria-label="Șterge">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-card">
            <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium text-foreground">
              Total net
            </td>
            <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-foreground">
              {formatMoney(totalNet)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
