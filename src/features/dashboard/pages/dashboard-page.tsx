import { Briefcase, Users, Wallet, CheckCircle2 } from "lucide-react";
import { useDashboardSummary } from "../hooks/use-dashboard-summary";
import { StatCard } from "../components/stat-card";
import { RecentWorksList } from "../components/recent-works-list";
import { formatMoney } from "@/shared/lib/utils";

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
        <h1 className="text-xl font-semibold text-foreground">Panou general</h1>
        <p className="text-sm text-muted-foreground">Situația curentă a laboratorului.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lucrări active" value={String(data.activeWorksCount)} icon={Briefcase} />
        <StatCard
          label="Finalizate luna asta"
          value={String(data.completedWorksThisMonth)}
          icon={CheckCircle2}
          accent="positive"
        />
        <StatCard label="Clienți" value={String(data.totalClients)} icon={Users} />
        <StatCard
          label="Costuri luna asta"
          value={formatMoney(data.totalCostsThisMonth)}
          icon={Wallet}
          accent="warning"
        />
      </div>

      <RecentWorksList works={data.recentWorks} />
    </div>
  );
}
