import { getPrismaClient, type DbClient } from "../../../shared/db";

export interface BackupRecordRow {
  id: string;
  filePath: string;
  sizeBytes: number;
  type: string;
  createdAt: Date;
}

export const backupRepository = {
  async findAll(db: DbClient = getPrismaClient()): Promise<BackupRecordRow[]> {
    return db.backupRecord.findMany({ orderBy: { createdAt: "desc" } });
  },

  async findById(id: string, db: DbClient = getPrismaClient()): Promise<BackupRecordRow | null> {
    return db.backupRecord.findUnique({ where: { id } });
  },

  async create(
    filePath: string,
    sizeBytes: number,
    type: "MANUAL" | "AUTO",
    db: DbClient = getPrismaClient(),
  ): Promise<BackupRecordRow> {
    return db.backupRecord.create({ data: { filePath, sizeBytes, type } });
  },

  async delete(id: string, db: DbClient = getPrismaClient()): Promise<void> {
    await db.backupRecord.delete({ where: { id } });
  },
};
