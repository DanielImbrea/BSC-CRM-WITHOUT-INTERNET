import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { EmployeesTab } from "@/features/employees/components/employees-tab";
import { SalariesTab } from "../components/salaries-tab";

export function SalariesPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Salarii</h1>
        <p className="text-sm text-muted-foreground">Angajați și salarii lunare.</p>
      </div>

      <Tabs defaultValue="salaries">
        <TabsList>
          <TabsTrigger value="salaries">Salarii</TabsTrigger>
          <TabsTrigger value="employees">Angajați</TabsTrigger>
        </TabsList>
        <TabsContent value="salaries">
          <SalariesTab />
        </TabsContent>
        <TabsContent value="employees">
          <EmployeesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
