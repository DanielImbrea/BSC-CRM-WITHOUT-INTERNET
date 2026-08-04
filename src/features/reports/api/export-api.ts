import type { SaveReportPdfRequest, SaveReportPdfResponse } from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const exportApi = {
  async saveReportPdf(payload: SaveReportPdfRequest): Promise<SaveReportPdfResponse> {
    return unwrapIpc(await window.labManager.export.saveReportPdf(payload));
  },
};
