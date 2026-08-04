import { getPrismaClient } from "../../../shared/db";

export const technicianRatesRepository = {
  async listByTechnician(technicianId: string) {
    const db = getPrismaClient();
    return db.technicianRate.findMany({ where: { technicianId } });
  },

  async upsert(
    technicianId: string,
    doctorId: string,
    workTypeId: string,
    pricePerUnit: number,
  ) {
    const db = getPrismaClient();
    return db.technicianRate.upsert({
      where: {
        technicianId_doctorId_workTypeId: { technicianId, doctorId, workTypeId },
      },
      create: { technicianId, doctorId, workTypeId, pricePerUnit },
      update: { pricePerUnit },
    });
  },

  async delete(technicianId: string, doctorId: string, workTypeId: string) {
    const db = getPrismaClient();
    await db.technicianRate.deleteMany({
      where: { technicianId, doctorId, workTypeId },
    });
  },

  async findPrice(
    technicianId: string,
    doctorId: string,
    workTypeId: string,
  ): Promise<number | null> {
    const db = getPrismaClient();
    const row = await db.technicianRate.findUnique({
      where: {
        technicianId_doctorId_workTypeId: { technicianId, doctorId, workTypeId },
      },
    });
    return row?.pricePerUnit ?? null;
  },
};
