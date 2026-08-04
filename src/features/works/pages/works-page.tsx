import * as React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { MonthPicker } from "@/shared/components/ui/date-picker";
import { useWorksList } from "../hooks/use-works";
import { useUpdateWorkPaymentStatus } from "../hooks/use-work-mutations";
import { WorksTable } from "../components/works-table";
import { WorkFormDialog } from "../components/work-form-dialog";
import { DeleteWorkDialog } from "../components/delete-work-dialog";
import type { WorkListItem } from "@shared-types/ipc";

const PAGE_SIZE = 50;

export function WorksPage() {
  const [month, setMonth] = React.useState(format(new Date(), "yyyy-MM"));
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, error } = useWorksList({ page, pageSize: PAGE_SIZE, month: month || undefined });
  const updatePaymentStatus = useUpdateWorkPaymentStatus();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingWorkId, setEditingWorkId] = React.useState<string | null>(null);
  const [deletingWork, setDeletingWork] = React.useState<WorkListItem | null>(null);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  React.useEffect(() => {
    setPage(1);
  }, [month]);

  function openCreateForm() {
    setEditingWorkId(null);
    setFormOpen(true);
  }

  function openEditForm(work: WorkListItem) {
    setEditingWorkId(work.id);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Lucrări</h1>
          <p className="text-sm text-muted-foreground">
            Afișare pe pagini — pentru tot istoricul folosește Căutare lucrări.
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Lucrare nouă
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex min-w-[220px] flex-col gap-1.5">
          <Label>Perioadă</Label>
          <MonthPicker allowAll value={month} onChange={setMonth} />
        </div>
        {data && (
          <p className="pb-2 text-sm text-muted-foreground">
            {data.total.toLocaleString("ro-RO")} {data.total === 1 ? "lucrare" : "lucrări"}
            {month ? "" : " (toate)"}
          </p>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca lucrările: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {data && (
        <>
          <WorksTable
            works={data.items}
            onEdit={openEditForm}
            onDelete={setDeletingWork}
            onPaymentStatusChange={(work, paymentStatus) => {
              void updatePaymentStatus.mutateAsync({ id: work.id, paymentStatus });
            }}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Pagina {data.page} din {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Înapoi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1"
                >
                  Înainte
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {formOpen && (
        <WorkFormDialog open={formOpen} onOpenChange={setFormOpen} workId={editingWorkId} />
      )}
      <DeleteWorkDialog work={deletingWork} onOpenChange={() => setDeletingWork(null)} />
    </div>
  );
}
