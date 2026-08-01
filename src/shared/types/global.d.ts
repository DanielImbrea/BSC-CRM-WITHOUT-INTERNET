import type { LabManagerApi } from "@shared-types/ipc";

declare global {
  interface Window {
    labManager: LabManagerApi;
  }
}

export {};
