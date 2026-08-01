import { getPrismaClient, type DbClient } from "../../../shared/db";
import type { MaterialInput } from "../domain/material-validation";

export interface MaterialRecord {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
  stockQuantity: number;
  minStockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export const materialsRepository = {
  async findAll(db: DbClient = getPrismaClient()): Promise<MaterialRecord[]> {
    return db.material.findMany({ orderBy: { name: "asc" } });
  },

  async findById(id: string, db: DbClient = getPrismaClient()): Promise<MaterialRecord | null> {
    return db.material.findUnique({ where: { id } });
  },

  /** Căutare case-insensitive după nume, folosită pentru validarea de unicitate. */
  async findByName(name: string, db: DbClient = getPrismaClient()): Promise<MaterialRecord | null> {
    const all = await db.material.findMany({ where: {} });
    return all.find((m) => m.name.toLowerCase() === name.trim().toLowerCase()) ?? null;
  },

  async create(input: MaterialInput, db: DbClient = getPrismaClient()): Promise<MaterialRecord> {
    return db.material.create({
      data: {
        name: input.name.trim(),
        unit: input.unit.trim(),
        unitCost: input.unitCost,
        stockQuantity: input.stockQuantity ?? 0,
        minStockQuantity: input.minStockQuantity ?? 0,
      },
    });
  },

  async update(id: string, input: MaterialInput, db: DbClient = getPrismaClient()): Promise<MaterialRecord> {
    return db.material.update({
      where: { id },
      data: {
        name: input.name.trim(),
        unit: input.unit.trim(),
        unitCost: input.unitCost,
        minStockQuantity: input.minStockQuantity ?? 0,
      },
    });
  },

  async delete(id: string, db: DbClient = getPrismaClient()): Promise<void> {
    await db.material.delete({ where: { id } });
  },

  /**
   * Ajustează stocul cu o cantitate (pozitivă = adaugă, negativă = consumă).
   * Trebuie apelat mereu în interiorul unei tranzacții atunci când însoțește
   * o altă scriere (ex: consum de material pe o Lucrare), ca să rămână atomic.
   */
  async adjustStock(id: string, delta: number, db: DbClient = getPrismaClient()): Promise<MaterialRecord> {
    return db.material.update({
      where: { id },
      data: { stockQuantity: { increment: delta } },
    });
  },
};
