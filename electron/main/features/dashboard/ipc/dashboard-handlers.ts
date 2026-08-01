import { IPC_CHANNELS } from "@shared-types/ipc";
import type { DashboardSummary } from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";
import { getDashboardSummary } from "../application/get-dashboard-summary";

export function registerDashboardHandlers(): void {
  registerIpcHandler<void, DashboardSummary>(IPC_CHANNELS.DASHBOARD_GET_SUMMARY, async () => {
    requireAuthenticated();
    return getDashboardSummary();
  });
}
