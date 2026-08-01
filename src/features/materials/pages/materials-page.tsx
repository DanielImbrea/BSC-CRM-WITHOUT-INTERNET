import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useMaterials } from "../hooks/use-materials";
import { MaterialsTable } from "../components/materials-table";
import { MaterialFormDialog } from "../components/material-form-dialog";
import { DeleteMaterialDialog } from "../components/delete-material-dialog";
import { AdjustStockDialog } from "../components/adjust-stock-dialog";
import type { MaterialListItem } from "@shared-types/ipc";

export function MaterialsPage() {
  const { data: materials, isLoading, isError, error } = useMaterials();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState<MaterialListItem | null>(null);
  const [deletingMaterial, setDeletingMaterial] = React.useState<MaterialListItem | null>(null);
  const [adjustingMaterial, setAdjustingMaterial] = React.useState<MaterialListItem | null>(null);

  function openCreateForm() {
    setEditingMaterial(null);
    setFormOpen(true);
  }

  function openEditForm(material: MaterialListItem) {
    setEditingMaterial(material);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Materiale</h1>
          <p className="text-sm text-muted-foreground">Stocul și prețurile materialelor laboratorului.</p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Material nou
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca materialele: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {materials && (
        <MaterialsTable
          materials={materials}
          onEdit={openEditForm}
          onDelete={setDeletingMaterial}
          onAdjustStock={setAdjustingMaterial}
        />
      )}

      <MaterialFormDialog open={formOpen} onOpenChange={setFormOpen} material={editingMaterial} />
      <DeleteMaterialDialog material={deletingMaterial} onOpenChange={() => setDeletingMaterial(null)} />
      <AdjustStockDialog material={adjustingMaterial} onOpenChange={() => setAdjustingMaterial(null)} />
    </div>
  );
}
