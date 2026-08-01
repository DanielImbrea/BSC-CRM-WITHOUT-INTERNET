import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteBackup } from "../hooks/use-backups";
import { formatDate } from "@/shared/lib/utils";
import type { BackupRecordDto } from "@shared-types/ipc";

interface DeleteBackupDialogProps {
  backup: BackupRecordDto | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBackupDialog({ backup, onOpenChange }: DeleteBackupDialogProps) {
  const deleteBackup = useDeleteBackup();

  async function handleConfirm() {
    if (!backup) return;
    await deleteBackup.mutateAsync(backup.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={backup !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ștergi backup-ul din {backup && formatDate(backup.createdAt)}?</DialogTitle>
          <DialogDescription>
            Fișierul de pe disc va fi șters definitiv. Acțiunea nu poate fi anulată.
          </DialogDescription>
        </DialogHeader>

        {deleteBackup.error && (
          <p className="text-xs text-destructive">
            {deleteBackup.error instanceof Error ? deleteBackup.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteBackup.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteBackup.isPending ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
