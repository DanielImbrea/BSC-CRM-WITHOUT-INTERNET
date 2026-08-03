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

  async findById(id: string): Promise<WorkTypeRecord | null> {
    const db = getPrismaClient();
    return db.workType.findUnique({ where: { id } });
  },

  async create(input: WorkTypeInput): Promise<WorkTypeRecord> {
    const db = getPrismaClient();
    return db.workType.create({
      data: {
        name: input.name.trim(),
        doctorPrice: input.doctorPrice,
        technicianPrice: input.technicianPrice,
      },
    });
  },

  async update(id: string, input: WorkTypeInput): Promise<WorkTypeRecord> {
    const db = getPrismaClient();
    return db.workType.update({
      where: { id },
      data: {
        name: input.name.trim(),
        doctorPrice: input.doctorPrice,
        technicianPrice: input.technicianPrice,
      },
    });
  },

  async delete(id: string): Promise<void> {
    const db = getPrismaClient();
    await db.workType.delete({ where: { id } });
  },
};
