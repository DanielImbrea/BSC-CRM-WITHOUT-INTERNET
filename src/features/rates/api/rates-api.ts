import { unwrapIpc } from "@/shared/lib/ipc";
import type { LookupLinePricesRequest, LookupLinePricesResponse } from "@shared-types/ipc";

export const ratesApi = {
  async lookupLinePrices(payload: LookupLinePricesRequest): Promise<LookupLinePricesResponse> {
    return unwrapIpc(await window.labManager.rates.lookupLinePrices(payload));
  },
};
