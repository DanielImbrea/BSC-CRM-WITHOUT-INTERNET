import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { FinancialSummaryTab } from "../components/financial-summary-tab";
import { ClientReportTab } from "../components/client-report-tab";
import { EmployeeReportTab } from "../components/employee-report-tab";

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Rapoarte</h1>
        <p className="text-sm text-muted-foreground">
          Sinteze financiare, pe client și pe angajat, pentru orice interval de date.
        </p>
      </div>

      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">Sumar financiar</TabsTrigger>
          <TabsTrigger value="clients">Pe client</TabsTrigger>
          <TabsTrigger value="employees">Pe angajat</TabsTrigger>
        </TabsList>
        <TabsContent value="financial">
          <FinancialSummaryTab />
        </TabsContent>
        <TabsContent value="clients">
          <ClientReportTab />
        </TabsContent>
        <TabsContent value="employees">
          <EmployeeReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
