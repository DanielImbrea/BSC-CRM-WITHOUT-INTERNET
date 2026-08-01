import type { Prisma } from "@prisma/client";
import { getPrismaClient, type DbClient } from "../../../shared/db";

export interface AuditLogFilters {
  entityType?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
  skip?: number;
  take?: number;
}

export interface AuditLogEntryRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  before: string | null;
  after: string | null;
  createdAt: Date;
}

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

export const auditLogRepository = {
  async findPage(
    filters: AuditLogFilters,
    db: DbClient = getPrismaClient(),
  ): Promise<{ entries: AuditLogEntryRow[]; total: number }> {
    const where: Prisma.AuditLogWhereInput = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lt: filters.dateTo } : {}),
      };
    }

    const take = Math.min(filters.take ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = filters.skip ?? 0;

    const [entries, total] = await Promise.all([
      db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      db.auditLog.count({ where }),
    ]);

    return { entries, total };
  },

  async listDistinctEntityTypes(db: DbClient = getPrismaClient()): Promise<string[]> {
    const rows = await db.auditLog.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    });
    return rows.map((r) => r.entityType);
  },

  async listDistinctActions(db: DbClient = getPrismaClient()): Promise<string[]> {
    const rows = await db.auditLog.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    });
    return rows.map((r) => r.action);
  },
};
