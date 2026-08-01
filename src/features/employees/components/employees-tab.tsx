import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useEmployees } from "../hooks/use-employees";
import { EmployeesTable } from "../components/employees-table";
import { EmployeeFormDialog } from "../components/employee-form-dialog";
import { DeleteEmployeeDialog } from "../components/delete-employee-dialog";
import type { EmployeeDto } from "@shared-types/ipc";

export function EmployeesTab() {
  const { data: employees, isLoading, isError, error } = useEmployees();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<EmployeeDto | null>(null);
  const [deletingEmployee, setDeletingEmployee] = React.useState<EmployeeDto | null>(null);

  function openCreateForm() {
    setEditingEmployee(null);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Angajat nou
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Nu am putut încărca angajații: {error instanceof Error ? error.message : "eroare necunoscută"}
        </p>
      )}

      {employees && (
        <EmployeesTable
          employees={employees}
          onEdit={(e) => {
            setEditingEmployee(e);
            setFormOpen(true);
          }}
          onDelete={setDeletingEmployee}
        />
      )}

      <EmployeeFormDialog open={formOpen} onOpenChange={setFormOpen} employee={editingEmployee} />
      <DeleteEmployeeDialog employee={deletingEmployee} onOpenChange={() => setDeletingEmployee(null)} />
    </div>
  );
}
