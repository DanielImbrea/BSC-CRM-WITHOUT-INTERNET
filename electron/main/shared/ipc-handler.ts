import { ipcMain, type IpcMainInvokeEvent } from "electron";
import type { IpcResult } from "@shared-types/ipc";
import { AppError } from "./errors";
import { logger } from "./logger";

/**
 * Înregistrează un handler IPC care întoarce mereu un IpcResult<T>,
 * indiferent dacă use-case-ul reușește sau aruncă o eroare.
 * Renderer-ul nu trebuie niciodată să prindă excepții brute din IPC —
 * primește mereu un obiect serializabil { ok, data | error }.
 */
export function registerIpcHandler<TRequest, TResponse>(
  channel: string,
  handler: (payload: TRequest) => Promise<TResponse>,
): void {
  ipcMain.handle(
    channel,
    async (_event: IpcMainInvokeEvent, payload: TRequest): Promise<IpcResult<TResponse>> => {
      try {
        const data = await handler(payload);
        return { ok: true, data };
      } catch (error) {
        if (error instanceof AppError) {
          logger.warn(`[${channel}] ${error.code}: ${error.message}`);
          return { ok: false, error: error.message };
        }
        logger.error(`[${channel}] Eroare neașteptată:`, error);
        return {
          ok: false,
          error: "A apărut o eroare neașteptată. Încearcă din nou.",
        };
      }
    },
  );
}
