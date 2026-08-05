import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useRestoreBackup } from "../hooks/use-backups";
import { formatDate } from "@/shared/lib/utils";
import type { BackupRecordDto } from "@shared-types/ipc";

interface RestoreBackupDialogProps {
  backup: BackupRecordDto | null;
  onOpenChange: (open: boolean) => void;
  onRestored?: (backup: BackupRecordDto) => void;
}

export function RestoreBackupDialog({ backup, onOpenChange, onRestored }: RestoreBackupDialogProps) {
  const restoreBackup = useRestoreBackup();
  const [confirmText, setConfirmText] = React.useState("");

  React.useEffect(() => {
    if (backup) {
      restoreBackup.reset();
      setConfirmText("");
    }
  }, [backup, restoreBackup]);

  async function handleConfirm() {
    if (!backup) return;
    await restoreBackup.mutateAsync(backup.id);
    onRestored?.(backup);
    onOpenChange(false);
  }

  return (
    <Dialog open={backup !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restaurezi backup-ul din {backup && formatDate(backup.createdAt)}?</DialogTitle>
          <DialogDescription>
            Toate datele actuale (clienți, lucrări, costuri, salarii etc.) vor fi{" "}
            <strong className="text-destructive">înlocuite ireversibil</strong> cu conținutul acestui
            backup. Orice modificare făcută după data backup-ului se pierde. Scrie{" "}
            <strong>RESTAUREAZĂ</strong> pentru confirmare.
          </DialogDescription>
        </DialogHeader>

        <input
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="RESTAUREAZĂ"
        />

        {restoreBackup.error && (
          <p className="text-xs text-destructive">
            {restoreBackup.error instanceof Error ? restoreBackup.error.message : "Eroare necunoscută."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={confirmText !== "RESTAUREAZĂ" || restoreBackup.isPending}
            onClick={() => void handleConfirm()}
          >
            {restoreBackup.isPending ? "Se restaurează..." : "Restaurează"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
