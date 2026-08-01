import {
  LayoutDashboard,
  Users,
  Briefcase,
  Package,
  Wallet,
  Banknote,
  UserCog,
  BarChart3,
  DatabaseBackup,
  Settings,
  ScrollText,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/shared/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Module care nu sunt încă implementate — afișate, dar dezactivate. */
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: "Panou general", path: "/", icon: LayoutDashboard },
  { label: "Clienți", path: "/clients", icon: Users },
  { label: "Lucrări", path: "/works", icon: Briefcase },
  { label: "Materiale", path: "/materials", icon: Package },
  { label: "Costuri", path: "/costs", icon: Wallet },
  { label: "Salarii", path: "/salaries", icon: Banknote },
  { label: "Cont", path: "/account", icon: UserCog },
  { label: "Rapoarte", path: "/reports", icon: BarChart3 },
  { label: "Backup", path: "/backup", icon: DatabaseBackup },
  { label: "Setări", path: "/settings", icon: Settings },
  { label: "Audit Log", path: "/audit-log", icon: ScrollText },
];

export function AppSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-5">
        <span className="text-sm font-semibold tracking-tight text-foreground">Lab Manager</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {navItems.map((item) =>
          item.disabled ? (
            <div
              key={item.path}
              className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
              title="Modul în curs de implementare"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  isActive && "bg-accent text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ),
        )}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 text-muted-foreground"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4" />
          Deconectare
        </Button>
      </div>
    </aside>
  );
}
