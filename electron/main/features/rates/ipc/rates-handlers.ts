import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  DoctorRateRow,
  GetDoctorRatesRequest,
  GetTechnicianRatesRequest,
  LookupLinePricesRequest,
  LookupLinePricesResponse,
  SaveDoctorRatesRequest,
  SaveTechnicianRatesRequest,
  TechnicianRatesGrid,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as rateUseCases from "../application/rate-use-cases";

export function registerRatesHandlers(): void {
  registerIpcHandler<GetDoctorRatesRequest, DoctorRateRow[]>(
    IPC_CHANNELS.DOCTORS_GET_RATES,
    async (payload) => rateUseCases.getDoctorRates(payload.doctorId),
  );

  registerIpcHandler<SaveDoctorRatesRequest, void>(
    IPC_CHANNELS.DOCTORS_SAVE_RATES,
    async (payload) => {
      await rateUseCases.saveDoctorRates(payload);
    },
  );

  registerIpcHandler<GetTechnicianRatesRequest, TechnicianRatesGrid>(
    IPC_CHANNELS.TECHNICIANS_GET_RATES,
    async (payload) => rateUseCases.getTechnicianRates(payload.technicianId),
  );

  registerIpcHandler<SaveTechnicianRatesRequest, void>(
    IPC_CHANNELS.TECHNICIANS_SAVE_RATES,
    async (payload) => {
      await rateUseCases.saveTechnicianRates(payload);
    },
  );

  registerIpcHandler<LookupLinePricesRequest, LookupLinePricesResponse>(
    IPC_CHANNELS.RATES_LOOKUP_LINE_PRICES,
    async (payload) => rateUseCases.lookupLinePrices(payload),
  );
}
