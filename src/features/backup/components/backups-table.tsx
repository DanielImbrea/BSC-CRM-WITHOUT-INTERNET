import { RotateCcw, Download, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatDate } from "@/shared/lib/utils";
import { useExportBackup } from "../hooks/use-backups";
import type { BackupRecordDto } from "@shared-types/ipc";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface BackupsTableProps {
  backups: BackupRecordDto[];
  onRestore: (backup: BackupRecordDto) => void;
  onDelete: (backup: BackupRecordDto) => void;
}

export function BackupsTable({ backups, onRestore, onDelete }: BackupsTableProps) {
  const exportBackup = useExportBackup();

  if (backups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">Niciun backup încă</p>
        <p className="text-sm text-muted-foreground">Creează primul backup cu butonul de mai sus.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Tip</th>
            <th className="px-4 py-3 font-medium">Dimensiune</th>
            <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {backups.map((backup) => (
            <tr key={backup.id} className="border-b border-border last:border-0 hover:bg-accent/40">
              <td className="px-4 py-3 font-medium text-foreground">{formatDate(backup.createdAt)}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {backup.type === "MANUAL" ? "Manual" : "Automat"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatBytes(backup.sizeBytes)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void exportBackup.mutateAsync(backup.id)}
                    aria-label="Exportă"
                    title="Exportă pe un stick USB sau alt folder"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRestore(backup)}
                    aria-label="Restaurează"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(backup)} aria-label="Șterge">
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
