import { getPrismaClient, type DbClient } from "../../../shared/db";
import type { WorkStatus } from "@shared-types/ipc";

export interface WorkMaterialRecord {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  unitCostAtTime: number;
}

export interface WorkCostRecord {
  id: string;
  description: string;
  amount: number;
  category: string;
}

export interface WorkListRecord {
  id: string;
  title: string;
  status: WorkStatus;
  clientName: string;
  startedAt: Date;
  totalCost: number;
}

export interface WorkDetailRecord {
  id: string;
  title: string;
  status: WorkStatus;
  clientId: string;
  clientName: string;
  startedAt: Date;
  finishedAt: Date | null;
  materials: WorkMaterialRecord[];
  costs: WorkCostRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export function computeTotalCost(
  costs: { amount: number }[],
  materials: { quantity: number; unitCostAtTime: number }[],
): number {
  const costsTotal = costs.reduce((sum, c) => sum + c.amount, 0);
  const materialsTotal = materials.reduce((sum, m) => sum + Math.round(m.quantity * m.unitCostAtTime), 0);
  return costsTotal + materialsTotal;
}

export const worksRepository = {
  async findAll(db: DbClient = getPrismaClient()): Promise<WorkListRecord[]> {
    const rows = await db.work.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        client: { select: { name: true } },
        costs: { select: { amount: true } },
        materials: { select: { quantity: true, unitCostAtTime: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      clientName: row.client.name,
      startedAt: row.startedAt,
      totalCost: computeTotalCost(row.costs, row.materials),
    }));
  },

  async findById(id: string, db: DbClient = getPrismaClient()): Promise<WorkDetailRecord | null> {
    const row = await db.work.findUnique({
      where: { id },
      include: {
        client: { select: { name: true } },
        materials: { include: { material: { select: { name: true, unit: true } } } },
        costs: true,
      },
    });
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      status: row.status,
      clientId: row.clientId,
      clientName: row.client.name,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      materials: row.materials.map((m) => ({
        id: m.id,
        materialId: m.materialId,
        materialName: m.material.name,
        unit: m.material.unit,
        quantity: m.quantity,
        unitCostAtTime: m.unitCostAtTime,
      })),
      costs: row.costs.map((c) => ({
        id: c.id,
        description: c.description,
        amount: c.amount,
        category: c.category,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  async createWork(title: string, clientId: string, db: DbClient): Promise<{ id: string }> {
    return db.work.create({ data: { title: title.trim(), clientId }, select: { id: true } });
  },

  async addWorkMaterial(
    workId: string,
    materialId: string,
    quantity: number,
    unitCostAtTime: number,
    db: DbClient,
  ): Promise<void> {
    await db.workMaterial.create({ data: { workId, materialId, quantity, unitCostAtTime } });
  },

  async addCostEntry(
    workId: string,
    description: string,
    amount: number,
    category: string,
    db: DbClient,
  ): Promise<void> {
    await db.costEntry.create({ data: { workId, description: description.trim(), amount, category: category.trim() } });
  },

  async listWorkMaterials(
    workId: string,
    db: DbClient = getPrismaClient(),
  ): Promise<{ materialId: string; quantity: number }[]> {
    return db.workMaterial.findMany({
      where: { workId },
      select: { materialId: true, quantity: true },
    });
  },

  async updateStatus(
    id: string,
    status: WorkStatus,
    finishedAt: Date | null,
    db: DbClient = getPrismaClient(),
  ): Promise<void> {
    await db.work.update({ where: { id }, data: { status, finishedAt } });
  },

  async deleteById(id: string, db: DbClient): Promise<void> {
    await db.work.delete({ where: { id } });
  },
};
