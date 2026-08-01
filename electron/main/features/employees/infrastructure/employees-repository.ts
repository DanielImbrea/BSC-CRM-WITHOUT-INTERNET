import { getPrismaClient, type DbClient } from "../../../shared/db";
import type { EmployeeInput } from "../domain/employee-validation";

export interface EmployeeRecord {
  id: string;
  name: string;
  position: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const employeesRepository = {
  async findAll(db: DbClient = getPrismaClient()): Promise<EmployeeRecord[]> {
    return db.employee.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });
  },

  async findById(id: string, db: DbClient = getPrismaClient()): Promise<EmployeeRecord | null> {
    return db.employee.findUnique({ where: { id } });
  },

  async create(input: EmployeeInput, db: DbClient = getPrismaClient()): Promise<EmployeeRecord> {
    return db.employee.create({
      data: {
        name: input.name.trim(),
        position: input.position?.trim() || null,
        active: input.active ?? true,
      },
    });
  },

  async update(id: string, input: EmployeeInput, db: DbClient = getPrismaClient()): Promise<EmployeeRecord> {
    return db.employee.update({
      where: { id },
      data: {
        name: input.name.trim(),
        position: input.position?.trim() || null,
        active: input.active ?? true,
      },
    });
  },

  async delete(id: string, db: DbClient = getPrismaClient()): Promise<void> {
    await db.employee.delete({ where: { id } });
  },
};
