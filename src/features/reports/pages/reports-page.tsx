import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { DoctorUnpaidTab } from "../components/doctor-unpaid-tab";
import { TechnicianSalaryTab } from "../components/technician-salary-tab";
import { MonthSummaryTab } from "../components/month-summary-tab";

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 print:gap-0 print:p-0">
      <div className="print:hidden">
        <h1 className="text-xl font-semibold text-foreground">Rapoarte</h1>
        <p className="text-sm text-muted-foreground">
          Rapoarte pe lună: neplătite, salarii tehnicieni și rezumat financiar.
        </p>
      </div>

      <Tabs defaultValue="doctor-unpaid">
        <TabsList className="print:hidden">
          <TabsTrigger value="doctor-unpaid">Neplătite doctor</TabsTrigger>
          <TabsTrigger value="technician-salary">Salariu tehnician</TabsTrigger>
          <TabsTrigger value="month-summary">Rezumat lună</TabsTrigger>
        </TabsList>
        <TabsContent value="doctor-unpaid">
          <DoctorUnpaidTab />
        </TabsContent>
        <TabsContent value="technician-salary">
          <TechnicianSalaryTab />
        </TabsContent>
        <TabsContent value="month-summary">
          <MonthSummaryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
