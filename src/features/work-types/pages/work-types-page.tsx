import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useWorkTypes } from "../hooks/use-work-types";
import { WorkTypesTable } from "../components/work-types-table";
import { WorkTypeFormDialog } from "../components/work-type-form-dialog";
import { DeleteWorkTypeDialog } from "../components/delete-work-type-dialog";
import type { WorkTypeDto } from "@shared-types/ipc";

export function WorkTypesPage() {
  const { data: workTypes, isLoading, isError, error } = useWorkTypes();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingWorkType, setEditingWorkType] = React.useState<WorkTypeDto | null>(null);
  const [deletingWorkType, setDeletingWorkType] = React.useState<WorkTypeDto | null>(null);

  function openCreateForm() {
    setEditingWorkType(null);
    setFormOpen(true);
  }

  function openEditForm(workType: WorkTypeDto) {
    setEditingWorkType(workType);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tipuri lucrări</h1>
          <p className="text-sm text-muted-foreground">Catalogul tipurilor de lucrări și prețurile implicite.</p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Tip nou
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca tipurile: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {workTypes && (
        <WorkTypesTable workTypes={workTypes} onEdit={openEditForm} onDelete={setDeletingWorkType} />
      )}

      <WorkTypeFormDialog open={formOpen} onOpenChange={setFormOpen} workType={editingWorkType} />
      <DeleteWorkTypeDialog workType={deletingWorkType} onOpenChange={() => setDeletingWorkType(null)} />
    </div>
  );
}
