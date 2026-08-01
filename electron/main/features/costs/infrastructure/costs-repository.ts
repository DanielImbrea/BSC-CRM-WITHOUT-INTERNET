import type { Prisma } from "@prisma/client";
import { getPrismaClient, type DbClient } from "../../../shared/db";
import type { CostInput } from "../domain/cost-validation";

export interface CostFilters {
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CostRecord {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  workId: string | null;
  workTitle: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toRecord(row: {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  workId: string | null;
  work: { title: string } | null;
  createdAt: Date;
  updatedAt: Date;
}): CostRecord {
  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    category: row.category,
    date: row.date,
    workId: row.workId,
    workTitle: row.work?.title ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const costsRepository = {
  async findAll(filters: CostFilters = {}, db: DbClient = getPrismaClient()): Promise<CostRecord[]> {
    const where: Prisma.CostEntryWhereInput = {};
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.date = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lt: filters.dateTo } : {}),
      };
    }

    const rows = await db.costEntry.findMany({
      where,
      orderBy: { date: "desc" },
      include: { work: { select: { title: true } } },
    });
    return rows.map(toRecord);
  },

  async findById(id: string, db: DbClient = getPrismaClient()): Promise<CostRecord | null> {
    const row = await db.costEntry.findUnique({
      where: { id },
      include: { work: { select: { title: true } } },
    });
    return row ? toRecord(row) : null;
  },

  async create(input: CostInput, db: DbClient = getPrismaClient()): Promise<CostRecord> {
    const row = await db.costEntry.create({
      data: {
        description: input.description.trim(),
        amount: input.amount,
        category: input.category.trim(),
        date: input.date,
        workId: input.workId ?? null,
      },
      include: { work: { select: { title: true } } },
    });
    return toRecord(row);
  },

  async update(id: string, input: CostInput, db: DbClient = getPrismaClient()): Promise<CostRecord> {
    const row = await db.costEntry.update({
      where: { id },
      data: {
        description: input.description.trim(),
        amount: input.amount,
        category: input.category.trim(),
        date: input.date,
        workId: input.workId ?? null,
      },
      include: { work: { select: { title: true } } },
    });
    return toRecord(row);
  },

  async delete(id: string, db: DbClient = getPrismaClient()): Promise<void> {
    await db.costEntry.delete({ where: { id } });
  },

  async listDistinctCategories(db: DbClient = getPrismaClient()): Promise<string[]> {
    const rows = await db.costEntry.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });
    return rows.map((r) => r.category);
  },
};
