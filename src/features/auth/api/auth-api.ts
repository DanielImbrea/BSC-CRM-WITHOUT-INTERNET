import type {
  AuthChangePasswordRequest,
  AuthIsConfiguredResponse,
  AuthLoginRequest,
  AuthSecurityInfoResponse,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const authApi = {
  async getStatus(): Promise<AuthIsConfiguredResponse> {
    const result = await window.labManager.auth.isConfigured();
    return unwrapIpc(result);
  },

  async setupPassword(password: string): Promise<void> {
    const result = await window.labManager.auth.setPassword({ password });
    return unwrapIpc(result);
  },

  async login(payload: AuthLoginRequest): Promise<void> {
    const result = await window.labManager.auth.login(payload);
    unwrapIpc(result);
  },

  async logout(): Promise<void> {
    const result = await window.labManager.auth.logout();
    return unwrapIpc(result);
  },

  async changePassword(payload: AuthChangePasswordRequest): Promise<void> {
    const result = await window.labManager.auth.changePassword(payload);
    return unwrapIpc(result);
  },

  async getSecurityInfo(): Promise<AuthSecurityInfoResponse> {
    const result = await window.labManager.auth.getSecurityInfo();
    return unwrapIpc(result);
  },

  async resetPassword(): Promise<void> {
    const result = await window.labManager.auth.resetPassword();
    return unwrapIpc(result);
  },
};
