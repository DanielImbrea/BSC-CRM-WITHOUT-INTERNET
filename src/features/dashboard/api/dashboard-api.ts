import type { DashboardSummary } from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const result = await window.labManager.dashboard.getSummary();
    return unwrapIpc(result);
  },
};
