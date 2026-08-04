import { writeFile } from "node:fs/promises";
import { BrowserWindow, dialog } from "electron";
import { IPC_CHANNELS } from "@shared-types/ipc";
import type { SaveReportPdfRequest, SaveReportPdfResponse } from "@shared-types/ipc";
import { registerIpcHandlerWithEvent } from "../../../shared/ipc-handler";
import { ValidationError } from "../../../shared/errors";

export function registerExportHandlers(): void {
  registerIpcHandlerWithEvent<SaveReportPdfRequest, SaveReportPdfResponse>(
    IPC_CHANNELS.EXPORT_SAVE_REPORT_PDF,
    async (payload, event) => {
      if (!payload.suggestedFileName.trim()) {
        throw new ValidationError("Numele fișierului PDF este invalid.");
      }

      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        throw new ValidationError("Nu am putut accesa fereastra aplicației.");
      }

      const result = await dialog.showSaveDialog(window, {
        title: "Salvează raport PDF",
        defaultPath: payload.suggestedFileName,
        filters: [{ name: "Document PDF", extensions: ["pdf"] }],
      });

      if (result.canceled || !result.filePath) {
        return { saved: false, path: null };
      }

      const pdfBuffer = await window.webContents.printToPDF({
        printBackground: true,
        pageSize: "A4",
        margins: {
          marginType: "custom",
          top: 0.4,
          bottom: 0.4,
          left: 0.4,
          right: 0.4,
        },
      });

      await writeFile(result.filePath, pdfBuffer);
      return { saved: true, path: result.filePath };
    },
  );
}
