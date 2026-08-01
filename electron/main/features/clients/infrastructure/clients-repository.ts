import { getPrismaClient } from "../../../shared/db";
import type { ClientInput } from "../domain/client-validation";

export interface ClientRecord {
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
}): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    worksCount: row._count.works,
  };
}

export const clientsRepository = {
  async findAll(): Promise<ClientRecord[]> {
    const db = getPrismaClient();
    const rows = await db.client.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { works: true } } },
    });
    return rows.map(toRecord);
  },

  async findById(id: string): Promise<ClientRecord | null> {
    const db = getPrismaClient();
    const row = await db.client.findUnique({
      where: { id },
      include: { _count: { select: { works: true } } },
    });
    return row ? toRecord(row) : null;
  },

  async create(input: ClientInput): Promise<ClientRecord> {
    const db = getPrismaClient();
    const row = await db.client.create({
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

  async update(id: string, input: ClientInput): Promise<ClientRecord> {
    const db = getPrismaClient();
    const row = await db.client.update({
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
    await db.client.delete({ where: { id } });
  },
};
