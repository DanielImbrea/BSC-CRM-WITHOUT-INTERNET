import { Pencil, Trash2, PackagePlus, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn, formatMoney } from "@/shared/lib/utils";
import type { MaterialListItem } from "@shared-types/ipc";

interface MaterialsTableProps {
  materials: MaterialListItem[];
  onEdit: (material: MaterialListItem) => void;
  onDelete: (material: MaterialListItem) => void;
  onAdjustStock: (material: MaterialListItem) => void;
}

export function MaterialsTable({ materials, onEdit, onDelete, onAdjustStock }: MaterialsTableProps) {
  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Niciun material încă</p>
        <p className="text-sm text-muted-foreground">Adaugă primul material cu butonul de mai sus.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Nume</th>
            <th className="px-4 py-3 font-medium">Unitate</th>
            <th className="px-4 py-3 font-medium">Cost unitar</th>
            <th className="px-4 py-3 font-medium">Stoc</th>
            <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => {
            const isLowStock = material.stockQuantity <= material.minStockQuantity;
            return (
              <tr key={material.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{material.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{material.unit}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatMoney(material.unitCost)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-foreground", isLowStock && "text-amber-400")}>
                      {material.stockQuantity} {material.unit}
                    </span>
                    {isLowStock && (
                      <span title={`Sub pragul minim de ${material.minStockQuantity} ${material.unit}`}>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAdjustStock(material)}
                      aria-label="Ajustează stoc"
                    >
                      <PackagePlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(material)} aria-label="Editează">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(material)} aria-label="Șterge">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
