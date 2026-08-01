import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { WorkStatusBadge } from "@/shared/components/work-status-badge";
import { formatDate } from "@/shared/lib/utils";
import type { DashboardSummary } from "@shared-types/ipc";

export function RecentWorksList({ works }: { works: DashboardSummary["recentWorks"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-foreground">Lucrări recente</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {works.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nu există încă nicio lucrare înregistrată.
          </p>
        )}
        {works.map((work) => (
          <div
            key={work.id}
            className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm hover:bg-accent/50"
          >
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{work.title}</span>
              <span className="text-xs text-muted-foreground">{work.clientName}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{formatDate(work.startedAt)}</span>
              <WorkStatusBadge status={work.status} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
