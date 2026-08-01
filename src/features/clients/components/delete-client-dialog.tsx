import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteClient } from "../hooks/use-client-mutations";
import type { ClientListItem } from "@shared-types/ipc";

interface DeleteClientDialogProps {
  client: ClientListItem | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteClientDialog({ client, onOpenChange }: DeleteClientDialogProps) {
  const deleteClient = useDeleteClient();

  async function handleConfirm() {
    if (!client) return;
    await deleteClient.mutateAsync(client.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={client !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi clientul „{client?.name}"?</DialogTitle>
          <DialogDescription>
            Acțiunea nu poate fi anulată.
            {client && client.worksCount > 0 && (
              <>
                {" "}
                Acest client are {client.worksCount}{" "}
                {client.worksCount === 1 ? "lucrare asociată" : "lucrări asociate"} — ștergerea va
                fi respinsă până când lucrările sunt reasignate sau șterse.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {deleteClient.error && (
          <p className="text-xs text-destructive">
            {deleteClient.error instanceof Error ? deleteClient.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteClient.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteClient.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
