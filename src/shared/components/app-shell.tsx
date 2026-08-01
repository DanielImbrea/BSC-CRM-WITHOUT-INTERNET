import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";

export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
