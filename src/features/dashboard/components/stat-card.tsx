import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "default" | "positive" | "warning";
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "text-primary bg-primary/10",
  positive: "text-emerald-400 bg-emerald-400/10",
  warning: "text-amber-400 bg-amber-400/10",
};

export function StatCard({ label, value, icon: Icon, accent = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", accentClasses[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xl font-semibold text-foreground">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}
