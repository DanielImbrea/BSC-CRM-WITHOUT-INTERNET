import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useWorks } from "../hooks/use-works";
import { WorksTable } from "../components/works-table";
import { CreateWorkDialog } from "../components/create-work-dialog";
import { WorkDetailDialog } from "../components/work-detail-dialog";
import { DeleteWorkDialog } from "../components/delete-work-dialog";
import type { WorkListItem } from "@shared-types/ipc";

export function WorksPage() {
  const { data: works, isLoading, isError, error } = useWorks();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [viewingWorkId, setViewingWorkId] = React.useState<string | null>(null);
  const [deletingWork, setDeletingWork] = React.useState<WorkListItem | null>(null);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Lucrări</h1>
          <p className="text-sm text-muted-foreground">Evidența lucrărilor laboratorului.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Lucrare nouă
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca lucrările: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {works && <WorksTable works={works} onView={(w) => setViewingWorkId(w.id)} onDelete={setDeletingWork} />}

      <CreateWorkDialog open={createOpen} onOpenChange={setCreateOpen} />
      <WorkDetailDialog workId={viewingWorkId} onOpenChange={() => setViewingWorkId(null)} />
      <DeleteWorkDialog work={deletingWork} onOpenChange={() => setDeletingWork(null)} />
    </div>
  );
}
