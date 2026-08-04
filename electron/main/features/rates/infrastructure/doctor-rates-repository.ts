import { getPrismaClient } from "../../../shared/db";

export const doctorRatesRepository = {
  async listByDoctor(doctorId: string) {
    const db = getPrismaClient();
    return db.doctorRate.findMany({ where: { doctorId } });
  },

  async upsert(doctorId: string, workTypeId: string, pricePerUnit: number) {
    const db = getPrismaClient();
    return db.doctorRate.upsert({
      where: { doctorId_workTypeId: { doctorId, workTypeId } },
      create: { doctorId, workTypeId, pricePerUnit },
      update: { pricePerUnit },
    });
  },

  async delete(doctorId: string, workTypeId: string) {
    const db = getPrismaClient();
    await db.doctorRate.deleteMany({ where: { doctorId, workTypeId } });
  },

  async findPrice(doctorId: string, workTypeId: string): Promise<number | null> {
    const db = getPrismaClient();
    const row = await db.doctorRate.findUnique({
      where: { doctorId_workTypeId: { doctorId, workTypeId } },
    });
    return row?.pricePerUnit ?? null;
  },
};
