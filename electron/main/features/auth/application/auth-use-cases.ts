import { hashPassword, verifyPassword } from "../domain/password-hash";
import { authRepository } from "../infrastructure/auth-repository";
import { assertPasswordIsValid } from "../domain/password-policy";
import { session } from "./session";
import { recordAuditEvent } from "../../audit-log/application/record-audit-event";
import { AUDIT_ACTIONS } from "../../audit-log/domain/audit-action";
import { UnauthorizedError, ValidationError, ConflictError } from "../../../shared/errors";

export async function getAuthStatus(): Promise<{ configured: boolean }> {
  const record = await authRepository.find();
  return { configured: record !== null };
}

/**
 * Modulul "Utilizatori" din specificația inițială a devenit, prin decizia
 * confirmată cu utilizatorul (single-user, o singură logare offline), un
 * ecran de cont/securitate — nu administrare de conturi multiple.
 */
export async function getSecurityInfo(): Promise<{ passwordUpdatedAt: Date }> {
  requireAuthenticated();
  const record = await authRepository.find();
  if (!record) {
    throw new ValidationError("Aplicația nu a fost încă configurată cu o parolă.");
  }
  return { passwordUpdatedAt: record.updatedAt };
}

/**
 * Setare inițială a parolei — permisă o singură dată (la prima rulare).
 * Pentru schimbarea parolei ulterioară, se folosește changePassword,
 * care cere parola curentă.
 */
export async function setupInitialPassword(password: string): Promise<void> {
  const existing = await authRepository.find();
  if (existing) {
    throw new ConflictError(
      "Parola a fost deja configurată. Folosește schimbarea parolei din Setări.",
    );
  }

  assertPasswordIsValid(password);
  const passwordHash = hashPassword(password);
  await authRepository.upsertPasswordHash(passwordHash);
  session.markAuthenticated();

  await recordAuditEvent({
    action: AUDIT_ACTIONS.AUTH_SETUP,
    entityType: "AppAuth",
  });
}

export async function login(password: string): Promise<void> {
  const record = await authRepository.find();
  if (!record) {
    throw new ValidationError("Aplicația nu a fost încă configurată cu o parolă.");
  }

  const isValid = verifyPassword(password, record.passwordHash);
  if (!isValid) {
    await recordAuditEvent({
      action: AUDIT_ACTIONS.AUTH_LOGIN_FAILURE,
      entityType: "AppAuth",
    });
    throw new UnauthorizedError("Parolă incorectă.");
  }

  session.markAuthenticated();
  await recordAuditEvent({
    action: AUDIT_ACTIONS.AUTH_LOGIN_SUCCESS,
    entityType: "AppAuth",
  });
}

export function logout(): void {
  session.clear();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const record = await authRepository.find();
  if (!record) {
    throw new ValidationError("Aplicația nu a fost încă configurată cu o parolă.");
  }

  const isValid = verifyPassword(currentPassword, record.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError("Parola curentă este incorectă.");
  }

  assertPasswordIsValid(newPassword);
  const passwordHash = hashPassword(newPassword);
  await authRepository.upsertPasswordHash(passwordHash);

  await recordAuditEvent({
    action: AUDIT_ACTIONS.AUTH_PASSWORD_CHANGE,
    entityType: "AppAuth",
  });
}

export async function resetPasswordForRecovery(): Promise<void> {
  await authRepository.clearPassword();
  session.clear();
}

export function requireAuthenticated(): void {
  if (!session.isAuthenticated()) {
    throw new UnauthorizedError();
  }
}
