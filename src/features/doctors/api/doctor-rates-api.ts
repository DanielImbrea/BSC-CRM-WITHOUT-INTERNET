import { unwrapIpc } from "@/shared/lib/ipc";
import type { DoctorRateRow, SaveDoctorRatesRequest } from "@shared-types/ipc";

export const doctorRatesApi = {
  async getRates(doctorId: string): Promise<DoctorRateRow[]> {
    return unwrapIpc(await window.labManager.doctors.getRates({ doctorId }));
  },

  async saveRates(payload: SaveDoctorRatesRequest): Promise<void> {
    return unwrapIpc(await window.labManager.doctors.saveRates(payload));
  },
};
