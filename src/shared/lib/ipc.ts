import type { IpcResult } from "@shared-types/ipc";

/**
 * Despachetează un IpcResult<T> întors de orice canal IPC.
 * Aruncă o eroare JS standard la eșec, ca React Query / React Hook Form
 * să trateze erorile uniform, fără verificări manuale de `.ok` în fiecare modul.
 */
export function unwrapIpc<T>(result: IpcResult<T>): T {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.data;
}
