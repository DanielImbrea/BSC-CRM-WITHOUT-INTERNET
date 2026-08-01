/**
 * Doar acțiunile critice se auditează (decizie confirmată cu utilizatorul):
 * ștergeri, modificări de salarii, autentificare, restaurări de backup.
 * NU logăm CRUD banal (ex: editare telefon client) — ar umple audit log-ul degeaba.
 */
export const AUDIT_ACTIONS = {
  DELETE: "DELETE",
  SALARY_CREATE: "SALARY_CREATE",
  SALARY_UPDATE: "SALARY_UPDATE",
  AUTH_SETUP: "AUTH_SETUP",
  AUTH_LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
  AUTH_LOGIN_FAILURE: "AUTH_LOGIN_FAILURE",
  AUTH_PASSWORD_CHANGE: "AUTH_PASSWORD_CHANGE",
  BACKUP_RESTORE: "BACKUP_RESTORE",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type AuditEntityType =
  | "Client"
  | "Work"
  | "Material"
  | "CostEntry"
  | "Employee"
  | "SalaryEntry"
  | "AppAuth"
  | "BackupRecord";
