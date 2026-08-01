import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthIsConfiguredResponse,
  AuthSetPasswordRequest,
  AuthChangePasswordRequest,
  AuthSecurityInfoResponse,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as authUseCases from "../application/auth-use-cases";

export function registerAuthHandlers(): void {
  registerIpcHandler<void, AuthIsConfiguredResponse>(IPC_CHANNELS.AUTH_IS_CONFIGURED, async () => {
    const status = await authUseCases.getAuthStatus();
    return { configured: status.configured };
  });

  registerIpcHandler<AuthSetPasswordRequest, void>(IPC_CHANNELS.AUTH_SET_PASSWORD, async (payload) => {
    await authUseCases.setupInitialPassword(payload.password);
  });

  registerIpcHandler<AuthLoginRequest, AuthLoginResponse>(IPC_CHANNELS.AUTH_LOGIN, async (payload) => {
    await authUseCases.login(payload.password);
    return { success: true };
  });

  registerIpcHandler<void, void>(IPC_CHANNELS.AUTH_LOGOUT, async () => {
    authUseCases.logout();
  });

  registerIpcHandler<AuthChangePasswordRequest, void>(
    IPC_CHANNELS.AUTH_CHANGE_PASSWORD,
    async (payload) => {
      await authUseCases.changePassword(payload.currentPassword, payload.newPassword);
    },
  );

  registerIpcHandler<void, AuthSecurityInfoResponse>(IPC_CHANNELS.AUTH_GET_SECURITY_INFO, async () => {
    const info = await authUseCases.getSecurityInfo();
    return { passwordUpdatedAt: info.passwordUpdatedAt.toISOString() };
  });
}
