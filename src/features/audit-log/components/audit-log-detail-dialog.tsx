import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { formatDate } from "@/shared/lib/utils";
import type { AuditLogEntryDto } from "@shared-types/ipc";

interface AuditLogDetailDialogProps {
  entry: AuditLogEntryDto | null;
  onOpenChange: (open: boolean) => void;
}

function prettyJson(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function AuditLogDetailDialog({ entry, onOpenChange }: AuditLogDetailDialogProps) {
  const before = entry ? prettyJson(entry.before) : null;
  const after = entry ? prettyJson(entry.after) : null;

  return (
    <Dialog open={entry !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {entry?.action} · {entry?.entityType}
          </DialogTitle>
          <DialogDescription>{entry && formatDate(entry.createdAt)}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-sm">
          {before && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Înainte</p>
              <pre className="max-h-48 overflow-auto rounded-md bg-secondary p-3 text-xs text-foreground">
                {before}
              </pre>
            </div>
          )}
          {after && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">După</p>
              <pre className="max-h-48 overflow-auto rounded-md bg-secondary p-3 text-xs text-foreground">
                {after}
              </pre>
            </div>
          )}
          {!before && !after && (
            <p className="text-sm text-muted-foreground">
              Această acțiune nu are un snapshot de date asociat.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
