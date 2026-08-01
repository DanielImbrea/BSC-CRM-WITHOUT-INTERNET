import * as React from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useBackups, useCreateBackup, useImportAndRestore } from "../hooks/use-backups";
import { BackupsTable } from "../components/backups-table";
import { RestoreBackupDialog } from "../components/restore-backup-dialog";
import { DeleteBackupDialog } from "../components/delete-backup-dialog";
import type { BackupRecordDto } from "@shared-types/ipc";

export function BackupPage() {
  const { data: backups, isLoading, isError, error } = useBackups();
  const createBackup = useCreateBackup();
  const importAndRestore = useImportAndRestore();

  const [restoringBackup, setRestoringBackup] = React.useState<BackupRecordDto | null>(null);
  const [deletingBackup, setDeletingBackup] = React.useState<BackupRecordDto | null>(null);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Backup</h1>
          <p className="text-sm text-muted-foreground">
            Copii de siguranță ale bazei de date locale. Aplicația nu face backup automat în cloud —
            toate copiile rămân pe acest calculator, decât dacă le exporți manual.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void importAndRestore.mutateAsync()}
            disabled={importAndRestore.isPending}
          >
            <Upload className="h-4 w-4" />
            Restaurează din fișier extern
          </Button>
          <Button
            className="gap-2"
            onClick={() => void createBackup.mutateAsync()}
            disabled={createBackup.isPending}
          >
            <Plus className="h-4 w-4" />
            {createBackup.isPending ? "Se creează..." : "Creează backup acum"}
          </Button>
        </div>
      </div>

      {importAndRestore.isError && (
        <p className="text-sm text-destructive">
          {importAndRestore.error instanceof Error
            ? importAndRestore.error.message
            : "Nu am putut restaura din fișierul selectat."}
        </p>
      )}
      {importAndRestore.data?.restored === false && (
        <p className="text-sm text-muted-foreground">Restaurare anulată.</p>
      )}
      {importAndRestore.data?.restored === true && (
        <p className="text-sm text-emerald-400">Baza de date a fost restaurată din fișierul selectat.</p>
      )}
      {createBackup.isError && (
        <p className="text-sm text-destructive">
          {createBackup.error instanceof Error ? createBackup.error.message : "Nu am putut crea backup-ul."}
        </p>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca backup-urile: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {backups && (
        <BackupsTable backups={backups} onRestore={setRestoringBackup} onDelete={setDeletingBackup} />
      )}

      <RestoreBackupDialog backup={restoringBackup} onOpenChange={() => setRestoringBackup(null)} />
      <DeleteBackupDialog backup={deletingBackup} onOpenChange={() => setDeletingBackup(null)} />
    </div>
  );
}
