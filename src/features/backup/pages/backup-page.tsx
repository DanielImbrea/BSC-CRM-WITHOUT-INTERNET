import * as React from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useBackups, useCreateBackup, useImportAndRestore } from "../hooks/use-backups";
import { BackupsTable } from "../components/backups-table";
import { RestoreBackupDialog } from "../components/restore-backup-dialog";
import { DeleteBackupDialog } from "../components/delete-backup-dialog";
import { formatDate } from "@/shared/lib/utils";
import type { BackupRecordDto } from "@shared-types/ipc";

function basenameFromPath(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || filePath;
}

function RestoreSuccessBanner({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
      <p className="font-medium text-emerald-300">{title}</p>
      <div className="mt-2 space-y-2 text-emerald-400/80">{children}</div>
    </div>
  );
}

export function BackupPage() {
  const { data: backups, isLoading, isError, error } = useBackups();
  const createBackup = useCreateBackup();
  const importAndRestore = useImportAndRestore();

  const [restoringBackup, setRestoringBackup] = React.useState<BackupRecordDto | null>(null);
  const [deletingBackup, setDeletingBackup] = React.useState<BackupRecordDto | null>(null);
  const [listRestoreSuccess, setListRestoreSuccess] = React.useState<BackupRecordDto | null>(null);
  const [createSuccessAt, setCreateSuccessAt] = React.useState<number | null>(null);

  async function handleCreateBackup() {
    await createBackup.mutateAsync();
    setCreateSuccessAt(Date.now());
    setListRestoreSuccess(null);
  }

  async function handleImportRestore() {
    const result = await importAndRestore.mutateAsync();
    if (result.restoredFrom) {
      setListRestoreSuccess(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Backup</h1>
          <p className="text-sm text-muted-foreground">
            Copii de siguranță locale ale bazei de date. Poți activa backup automat la închiderea
            aplicației din Setări. Nu se trimite nimic în cloud — exportă manual dacă vrei o copie pe stick
            sau alt calculator.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void handleImportRestore()}
            disabled={importAndRestore.isPending}
          >
            <Upload className="h-4 w-4" />
            Restaurează din fișier extern
          </Button>
          <Button
            className="gap-2"
            onClick={() => void handleCreateBackup()}
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
      {importAndRestore.data?.restoredFrom && (
        <RestoreSuccessBanner title="Restaurare reușită">
          <p className="text-emerald-400/90">
            Baza de date a fost înlocuită cu fișierul{" "}
            <span className="font-medium">{basenameFromPath(importAndRestore.data.restoredFrom)}</span>.
          </p>
          <p>
            Restaurarea din fișier extern nu apare în lista de mai jos — doar backup-urile create cu
            „Creează backup acum”. Repornește aplicația ca să vezi datele restaurate peste tot; apoi poți
            crea un backup manual dacă vrei o copie în listă.
          </p>
        </RestoreSuccessBanner>
      )}
      {listRestoreSuccess && (
        <RestoreSuccessBanner title="Restaurare reușită">
          <p className="text-emerald-400/90">
            Baza de date a fost înlocuită cu backup-ul din{" "}
            <span className="font-medium">{formatDate(listRestoreSuccess.createdAt)}</span>.
          </p>
          <p>Repornește aplicația ca să vezi datele restaurate peste tot.</p>
        </RestoreSuccessBanner>
      )}
      {createSuccessAt && !createBackup.isError && (
        <p className="text-sm text-emerald-400">Backup creat cu succes și adăugat în listă.</p>
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

      <RestoreBackupDialog
        backup={restoringBackup}
        onOpenChange={(open) => {
          if (!open) setRestoringBackup(null);
        }}
        onRestored={(backup) => {
          setListRestoreSuccess(backup);
          setCreateSuccessAt(null);
        }}
      />
      <DeleteBackupDialog
        backup={deletingBackup}
        onOpenChange={(open) => {
          if (!open) setDeletingBackup(null);
        }}
      />
    </div>
  );
}
