import { Briefcase, Users, Stethoscope, AlertCircle } from "lucide-react";
import { useDashboardSummary } from "../hooks/use-dashboard-summary";
import { StatCard } from "../components/stat-card";

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardSummary();

  if (isLoading) {
    return <p className="p-8 text-sm text-muted-foreground">Se încarcă panoul...</p>;
  }

  if (isError) {
    return (
      <p className="p-8 text-sm text-destructive">
        Nu am putut încărca datele: {error instanceof Error ? error.message : "eroare necunoscută"}
      </p>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Acasă</h1>
        <p className="text-sm text-muted-foreground">Situația curentă a laboratorului.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Lucrări luna aceasta"
          value={String(data.worksThisMonth)}
          icon={Briefcase}
        />
        <StatCard
          label="Lucrări neplătite"
          value={String(data.unpaidWorks)}
          icon={AlertCircle}
          accent="warning"
        />
        <StatCard label="Doctori" value={String(data.doctorsCount)} icon={Stethoscope} />
        <StatCard label="Tehnicieni" value={String(data.techniciansCount)} icon={Users} />
      </div>
    </div>
  );
}
