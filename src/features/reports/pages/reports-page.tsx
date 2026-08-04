import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { DoctorUnpaidTab } from "../components/doctor-unpaid-tab";
import { TechnicianSalaryTab } from "../components/technician-salary-tab";

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 print:gap-0 print:p-0">
      <div className="print:hidden">
        <h1 className="text-xl font-semibold text-foreground">Rapoarte</h1>
        <p className="text-sm text-muted-foreground">
          Rapoarte de lucrări neplătite și salarii tehnicieni, pe lună.
        </p>
      </div>

      <Tabs defaultValue="doctor-unpaid">
        <TabsList className="print:hidden">
          <TabsTrigger value="doctor-unpaid">Neplătite doctor</TabsTrigger>
          <TabsTrigger value="technician-salary">Salariu tehnician</TabsTrigger>
        </TabsList>
        <TabsContent value="doctor-unpaid">
          <DoctorUnpaidTab />
        </TabsContent>
        <TabsContent value="technician-salary">
          <TechnicianSalaryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
