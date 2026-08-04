import { getPrismaClient } from "../../../shared/db";
import type { TechnicianInput } from "../domain/technician-validation";

export interface TechnicianRecord {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const techniciansRepository = {
  async findAll(): Promise<TechnicianRecord[]> {
    const db = getPrismaClient();
    return db.technician.findMany({ orderBy: { name: "asc" } });
  },

  async findPage(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: TechnicianRecord[]; total: number; page: number; pageSize: number }> {
    const db = getPrismaClient();
    const page = Math.max(1, params.page);
    const pageSize = Math.min(200, Math.max(1, params.pageSize));
    const where = params.search?.trim()
      ? { name: { contains: params.search.trim() } }
      : {};

    const [total, items] = await Promise.all([
      db.technician.count({ where }),
      db.technician.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total, page, pageSize };
  },

  async findById(id: string): Promise<TechnicianRecord | null> {
    const db = getPrismaClient();
    return db.technician.findUnique({ where: { id } });
  },

  async create(input: TechnicianInput): Promise<TechnicianRecord> {
    const db = getPrismaClient();
    return db.technician.create({
      data: { name: input.name.trim(), active: input.active ?? true },
    });
  },

  async update(id: string, input: TechnicianInput & { active: boolean }): Promise<TechnicianRecord> {
    const db = getPrismaClient();
    return db.technician.update({
      where: { id },
      data: { name: input.name.trim(), active: input.active },
    });
  },

  async delete(id: string): Promise<void> {
    const db = getPrismaClient();
    await db.technician.delete({ where: { id } });
  },
};
