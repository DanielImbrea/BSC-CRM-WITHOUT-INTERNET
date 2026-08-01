import type { AppSettingsDto } from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const settingsApi = {
  async get(): Promise<AppSettingsDto> {
    return unwrapIpc(await window.labManager.settings.get());
  },
  async update(payload: AppSettingsDto): Promise<AppSettingsDto> {
    return unwrapIpc(await window.labManager.settings.update(payload));
  },
};
