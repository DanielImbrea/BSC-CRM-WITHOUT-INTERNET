import { getPrismaClient } from "../../../shared/db";
import type { WorkTypeInput } from "../domain/work-type-validation";

export interface WorkTypeRecord {
  id: string;
  name: string;
  doctorPrice: number;
  technicianPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export const workTypesRepository = {
  async findAll(): Promise<WorkTypeRecord[]> {
    const db = getPrismaClient();
    return db.workType.findMany({ orderBy: { name: "asc" } });
  },

  async findPage(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: WorkTypeRecord[]; total: number; page: number; pageSize: number }> {
    const db = getPrismaClient();
    const page = Math.max(1, params.page);
    const pageSize = Math.min(200, Math.max(1, params.pageSize));
    const where = params.search?.trim()
      ? { name: { contains: params.search.trim() } }
      : {};

    const [total, items] = await Promise.all([
      db.workType.count({ where }),
      db.workType.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total, page, pageSize };
  },

  async findById(id: string): Promise<WorkTypeRecord | null> {
    const db = getPrismaClient();
    return db.workType.findUnique({ where: { id } });
  },

  async create(input: WorkTypeInput): Promise<WorkTypeRecord> {
    const db = getPrismaClient();
    return db.workType.create({
      data: {
        name: input.name.trim(),
        doctorPrice: 0,
        technicianPrice: 0,
      },
    });
  },

  async update(id: string, input: WorkTypeInput): Promise<WorkTypeRecord> {
    const db = getPrismaClient();
    return db.workType.update({
      where: { id },
      data: {
        name: input.name.trim(),
      },
    });
  },

  async delete(id: string): Promise<void> {
    const db = getPrismaClient();
    await db.workType.delete({ where: { id } });
  },
};
