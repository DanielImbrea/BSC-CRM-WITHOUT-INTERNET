import { getPrismaClient } from "../../../shared/db";
import type { DoctorInput } from "../domain/doctor-validation";

export interface DoctorRecord {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  worksCount: number;
}

function toRecord(row: {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { works: number };
}): DoctorRecord {
  return { ...row, worksCount: row._count.works };
}

export const doctorsRepository = {
  async findAll(): Promise<DoctorRecord[]> {
    const db = getPrismaClient();
    const rows = await db.doctor.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { works: true } } },
    });
    return rows.map(toRecord);
  },

  async findPage(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: DoctorRecord[]; total: number; page: number; pageSize: number }> {
    const db = getPrismaClient();
    const page = Math.max(1, params.page);
    const pageSize = Math.min(200, Math.max(1, params.pageSize));
    const term = params.search?.trim();
    const where = term
      ? {
          OR: [
            { name: { contains: term } },
            { phone: { contains: term } },
            { email: { contains: term } },
          ],
        }
      : {};

    const [total, rows] = await Promise.all([
      db.doctor.count({ where }),
      db.doctor.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { works: true } } },
      }),
    ]);

    return { items: rows.map(toRecord), total, page, pageSize };
  },

  async findById(id: string): Promise<DoctorRecord | null> {
    const db = getPrismaClient();
    const row = await db.doctor.findUnique({
      where: { id },
      include: { _count: { select: { works: true } } },
    });
    return row ? toRecord(row) : null;
  },

  async create(input: DoctorInput): Promise<DoctorRecord> {
    const db = getPrismaClient();
    const row = await db.doctor.create({
      data: {
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        address: input.address?.trim() || null,
      },
      include: { _count: { select: { works: true } } },
    });
    return toRecord(row);
  },

  async update(id: string, input: DoctorInput): Promise<DoctorRecord> {
    const db = getPrismaClient();
    const row = await db.doctor.update({
      where: { id },
      data: {
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        address: input.address?.trim() || null,
      },
      include: { _count: { select: { works: true } } },
    });
    return toRecord(row);
  },

  async delete(id: string): Promise<void> {
    const db = getPrismaClient();
    await db.doctor.delete({ where: { id } });
  },
};
