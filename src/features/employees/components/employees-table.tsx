import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { EmployeeDto } from "@shared-types/ipc";

interface EmployeesTableProps {
  employees: EmployeeDto[];
  onEdit: (employee: EmployeeDto) => void;
  onDelete: (employee: EmployeeDto) => void;
}

export function EmployeesTable({ employees, onEdit, onDelete }: EmployeesTableProps) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Niciun angajat încă</p>
        <p className="text-sm text-muted-foreground">Adaugă primul angajat cu butonul de mai sus.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Nume</th>
            <th className="px-4 py-3 font-medium">Funcție</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-accent/40">
              <td className="px-4 py-3 font-medium text-foreground">{employee.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{employee.position ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    employee.active ? "bg-emerald-400/10 text-emerald-400" : "bg-muted text-muted-foreground",
                  )}
                >
                  {employee.active ? "Activ" : "Inactiv"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(employee)} aria-label="Editează">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(employee)} aria-label="Șterge">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
