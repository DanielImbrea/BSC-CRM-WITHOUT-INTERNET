import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { ClientListItem } from "@shared-types/ipc";

interface ClientsTableProps {
  clients: ClientListItem[];
  onEdit: (client: ClientListItem) => void;
  onDelete: (client: ClientListItem) => void;
}

export function ClientsTable({ clients, onEdit, onDelete }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Niciun client încă</p>
        <p className="text-sm text-muted-foreground">Adaugă primul client cu butonul de mai sus.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Nume</th>
            <th className="px-4 py-3 font-medium">Telefon</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Lucrări</th>
            <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-border last:border-0 hover:bg-accent/40">
              <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{client.phone ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{client.email ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{client.worksCount}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(client)} aria-label="Editează">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(client)} aria-label="Șterge">
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
