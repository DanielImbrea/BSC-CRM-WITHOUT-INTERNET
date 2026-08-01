import { IPC_CHANNELS } from "@shared-types/ipc";
import type { AppSettingsDto } from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as settingsUseCases from "../application/settings-use-cases";

export function registerSettingsHandlers(): void {
  registerIpcHandler<void, AppSettingsDto>(IPC_CHANNELS.SETTINGS_GET, async () => {
    return settingsUseCases.getAppSettings();
  });

  registerIpcHandler<AppSettingsDto, AppSettingsDto>(IPC_CHANNELS.SETTINGS_UPDATE, async (payload) => {
    return settingsUseCases.updateAppSettings(payload);
  });
}
