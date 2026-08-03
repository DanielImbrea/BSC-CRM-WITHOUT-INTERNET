import { createHashRouter } from "react-router-dom";
import { AppShell } from "@/shared/components/app-shell";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { WorkSearchPage } from "@/features/work-search/pages/work-search-page";
import { DoctorsPage } from "@/features/doctors/pages/doctors-page";
import { TechniciansPage } from "@/features/technicians/pages/technicians-page";
import { WorksPage } from "@/features/works/pages/works-page";
import { WorkTypesPage } from "@/features/work-types/pages/work-types-page";
import { AccountPage } from "@/features/auth/pages/account-page";
import { ReportsPage } from "@/features/reports/pages/reports-page";
import { BackupPage } from "@/features/backup/pages/backup-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";

/**
 * HashRouter, nu BrowserRouter — obligatoriu în Electron cu `loadFile`,
 * fiindcă nu există un server HTTP care să rezolve rutele la refresh.
 */
export const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/search", element: <WorkSearchPage /> },
      { path: "/doctors", element: <DoctorsPage /> },
      { path: "/technicians", element: <TechniciansPage /> },
      { path: "/works", element: <WorksPage /> },
      { path: "/work-types", element: <WorkTypesPage /> },
      { path: "/account", element: <AccountPage /> },
      { path: "/reports", element: <ReportsPage /> },
      { path: "/backup", element: <BackupPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
