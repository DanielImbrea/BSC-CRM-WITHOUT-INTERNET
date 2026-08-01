import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useClients } from "../hooks/use-clients";
import { ClientsTable } from "../components/clients-table";
import { ClientFormDialog } from "../components/client-form-dialog";
import { DeleteClientDialog } from "../components/delete-client-dialog";
import type { ClientListItem } from "@shared-types/ipc";

export function ClientsPage() {
  const { data: clients, isLoading, isError, error } = useClients();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingClientId, setEditingClientId] = React.useState<string | null>(null);
  const [deletingClient, setDeletingClient] = React.useState<ClientListItem | null>(null);

  function openCreateForm() {
    setEditingClientId(null);
    setFormOpen(true);
  }

  function openEditForm(client: ClientListItem) {
    setEditingClientId(client.id);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Clienți</h1>
          <p className="text-sm text-muted-foreground">Evidența clienților laboratorului.</p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Client nou
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca clienții: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {clients && (
        <ClientsTable clients={clients} onEdit={openEditForm} onDelete={setDeletingClient} />
      )}

      <ClientFormDialog open={formOpen} onOpenChange={setFormOpen} clientId={editingClientId} />
      <DeleteClientDialog client={deletingClient} onOpenChange={() => setDeletingClient(null)} />
    </div>
  );
}
