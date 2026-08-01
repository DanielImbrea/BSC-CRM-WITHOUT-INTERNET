import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatMoney, formatDate } from "@/shared/lib/utils";
import type { CostEntryDto } from "@shared-types/ipc";

interface CostsTableProps {
  costs: CostEntryDto[];
  onEdit: (cost: CostEntryDto) => void;
  onDelete: (cost: CostEntryDto) => void;
}

export function CostsTable({ costs, onEdit, onDelete }: CostsTableProps) {
  if (costs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Niciun cost înregistrat</p>
        <p className="text-sm text-muted-foreground">Adaugă primul cost cu butonul de mai sus.</p>
      </div>
    );
  }

  const total = costs.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Descriere</th>
            <th className="px-4 py-3 font-medium">Categorie</th>
            <th className="px-4 py-3 font-medium">Lucrare</th>
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Sumă</th>
            <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {costs.map((cost) => (
            <tr key={cost.id} className="border-b border-border last:border-0 hover:bg-accent/40">
              <td className="px-4 py-3 font-medium text-foreground">{cost.description}</td>
              <td className="px-4 py-3 text-muted-foreground">{cost.category}</td>
              <td className="px-4 py-3 text-muted-foreground">{cost.workTitle ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(cost.date)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatMoney(cost.amount)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(cost)} aria-label="Editează">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(cost)} aria-label="Șterge">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-card">
            <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-foreground">
              Total
            </td>
            <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-foreground">
              {formatMoney(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
