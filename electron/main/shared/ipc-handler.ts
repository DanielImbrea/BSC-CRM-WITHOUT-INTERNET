import { ipcMain, type IpcMainInvokeEvent } from "electron";
import type { IpcResult } from "@shared-types/ipc";
import { Prisma } from "./prisma";
import { AppError } from "./errors";
import { logger } from "./logger";

function mapUnexpectedError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") {
      return "Baza de date nu este inițializată. Repornește aplicația sau reinstaleaz-o.";
    }
    logger.error("Eroare Prisma:", error.code, error.message);
    return `Eroare bază de date (${error.code}). Repornește aplicația.`;
  }

  if (error instanceof Error) {
    logger.error("Eroare neașteptată:", error.message, error.stack);
    return error.message;
  }

  return "A apărut o eroare neașteptată. Încearcă din nou.";
}

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
          error: mapUnexpectedError(error),
        };
      }
    },
  );
}
