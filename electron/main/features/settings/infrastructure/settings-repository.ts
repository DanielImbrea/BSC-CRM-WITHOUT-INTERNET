import { getPrismaClient, type DbClient } from "../../../shared/db";

export const settingsRepository = {
  async get(key: string, db: DbClient = getPrismaClient()): Promise<string | null> {
    const row = await db.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  },

  async set(key: string, value: string, db: DbClient = getPrismaClient()): Promise<void> {
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  },
};
