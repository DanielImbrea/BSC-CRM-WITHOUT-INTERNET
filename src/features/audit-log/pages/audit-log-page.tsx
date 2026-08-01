import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useAuditLog } from "../hooks/use-audit-log";
import { AuditLogFilterBar } from "../components/audit-log-filter-bar";
import { AuditLogTable } from "../components/audit-log-table";
import { AuditLogDetailDialog } from "../components/audit-log-detail-dialog";
import type { AuditLogEntryDto, ListAuditLogFilters } from "@shared-types/ipc";

const PAGE_SIZE = 50;

export function AuditLogPage() {
  const [filters, setFilters] = React.useState<ListAuditLogFilters>({ skip: 0, take: PAGE_SIZE });
  const { data, isLoading, isError, error } = useAuditLog(filters);
  const [selectedEntry, setSelectedEntry] = React.useState<AuditLogEntryDto | null>(null);

  const skip = filters.skip ?? 0;
  const total = data?.total ?? 0;
  const hasPrev = skip > 0;
  const hasNext = skip + PAGE_SIZE < total;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Jurnal de audit</h1>
        <p className="text-sm text-muted-foreground">
          Istoric al acțiunilor critice: ștergeri, modificări de salarii, autentificări, restaurări de
          backup. Apasă pe un rând pentru detalii.
        </p>
      </div>

      <AuditLogFilterBar filters={filters} onChange={(next) => setFilters({ ...next, take: PAGE_SIZE })} />

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca jurnalul: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {data && (
        <>
          <AuditLogTable entries={data.entries} onSelect={setSelectedEntry} />

          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} din {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setFilters({ ...filters, skip: Math.max(0, skip - PAGE_SIZE) })}
                  className="gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setFilters({ ...filters, skip: skip + PAGE_SIZE })}
                  className="gap-1"
                >
                  Următor
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AuditLogDetailDialog entry={selectedEntry} onOpenChange={() => setSelectedEntry(null)} />
    </div>
  );
}
