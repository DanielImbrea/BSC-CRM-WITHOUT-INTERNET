import { unwrapIpc } from "@/shared/lib/ipc";
import type { SaveTechnicianRatesRequest, TechnicianRatesGrid } from "@shared-types/ipc";

export const technicianRatesApi = {
  async getRates(technicianId: string): Promise<TechnicianRatesGrid> {
    return unwrapIpc(await window.labManager.technicians.getRates({ technicianId }));
  },

  async saveRates(payload: SaveTechnicianRatesRequest): Promise<void> {
    return unwrapIpc(await window.labManager.technicians.saveRates(payload));
  },
};
