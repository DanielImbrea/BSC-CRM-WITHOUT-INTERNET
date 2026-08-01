import { createHashRouter } from "react-router-dom";
import { AppShell } from "@/shared/components/app-shell";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { ClientsPage } from "@/features/clients/pages/clients-page";
import { WorksPage } from "@/features/works/pages/works-page";
import { MaterialsPage } from "@/features/materials/pages/materials-page";
import { CostsPage } from "@/features/costs/pages/costs-page";
import { SalariesPage } from "@/features/salaries/pages/salaries-page";
import { AccountPage } from "@/features/auth/pages/account-page";
import { ReportsPage } from "@/features/reports/pages/reports-page";
import { BackupPage } from "@/features/backup/pages/backup-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { AuditLogPage } from "@/features/audit-log/pages/audit-log-page";

/**
 * HashRouter, nu BrowserRouter — obligatoriu în Electron cu `loadFile`,
 * fiindcă nu există un server HTTP care să rezolve rutele la refresh.
 */
export const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/clients", element: <ClientsPage /> },
      { path: "/works", element: <WorksPage /> },
      { path: "/materials", element: <MaterialsPage /> },
      { path: "/costs", element: <CostsPage /> },
      { path: "/salaries", element: <SalariesPage /> },
      { path: "/account", element: <AccountPage /> },
      { path: "/reports", element: <ReportsPage /> },
      { path: "/backup", element: <BackupPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/audit-log", element: <AuditLogPage /> },
    ],
  },
]);
