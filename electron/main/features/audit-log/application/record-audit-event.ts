import { getPrismaClient } from "../../../shared/db";
import { logger } from "../../../shared/logger";
import type { AuditAction, AuditEntityType } from "../domain/audit-action";

export interface RecordAuditEventInput {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  before?: unknown;
  after?: unknown;
}

/**
 * Scrie o intrare în audit log. Nu aruncă erori care ar bloca acțiunea
 * originală — dacă logarea eșuează, o notăm în log-ul de aplicație,
 * dar nu anulăm operațiunea de business care a declanșat-o.
 */
export async function recordAuditEvent(input: RecordAuditEventInput): Promise<void> {
  try {
    const db = getPrismaClient();
    await db.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before !== undefined ? JSON.stringify(input.before) : null,
        after: input.after !== undefined ? JSON.stringify(input.after) : null,
      },
    });
  } catch (error) {
    logger.error("Nu s-a putut scrie intrarea de audit log:", error);
  }
}
