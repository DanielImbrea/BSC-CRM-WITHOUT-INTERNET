import type { Prisma } from "prisma-client";
import type { PaymentStatus, SearchWorksFilters } from "@shared-types/ipc";
import { getPrismaClient, type DbClient } from "../../../shared/db";
import { buildSearchDateRange } from "../domain/work-validation";

export interface WorkLineRecord {
  id: string;
  workTypeId: string;
  workTypeName: string;
  technicianId: string | null;
  technicianName: string | null;
  technician2Id: string | null;
  technician2Name: string | null;
  technician3Id: string | null;
  technician3Name: string | null;
  quantity: number;
  doctorUnitPrice: number;
  technicianUnitPrice: number;
}

export interface WorkListRecord {
  id: string;
  entryDate: Date;
  patientName: string;
  doctorName: string;
  observations: string | null;
  paymentStatus: PaymentStatus;
  doctorTotal: number;
  technicianTotal: number;
  workSummary: string;
  technician1Name: string | null;
  technician2Name: string | null;
  technician3Name: string | null;
}

export interface WorkDetailRecord {
  id: string;
  entryDate: Date;
  patientName: string;
  observations: string | null;
  paymentStatus: PaymentStatus;
  doctorId: string;
  doctorName: string;
  technician1Id: string | null;
  technician1Name: string | null;
  technician2Id: string | null;
  technician2Name: string | null;
  technician3Id: string | null;
  technician3Name: string | null;
  lines: WorkLineRecord[];
  doctorTotal: number;
  technicianTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

type WorkWithRelations = Prisma.WorkGetPayload<{
  include: {
    doctor: true;
    technician1: true;
    technician2: true;
    technician3: true;
    lines: { include: { workType: true; technician: true; technician2: true; technician3: true } };
  };
}>;

function mapLines(work: WorkWithRelations): WorkLineRecord[] {
  return work.lines.map((line) => ({
    id: line.id,
    workTypeId: line.workTypeId,
    workTypeName: line.workType.name,
    technicianId: line.technicianId,
    technicianName: line.technician?.name ?? null,
    technician2Id: line.technician2Id,
    technician2Name: line.technician2?.name ?? null,
    technician3Id: line.technician3Id,
    technician3Name: line.technician3?.name ?? null,
    quantity: line.quantity,
    doctorUnitPrice: line.doctorUnitPrice,
    technicianUnitPrice: line.technicianUnitPrice,
  }));
}

function uniqueTechnicianNames(lines: WorkLineRecord[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const line of lines) {
    for (const name of [line.technicianName, line.technician2Name, line.technician3Name]) {
      if (name && !seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    }
  }
  return names;
}

export function computeDoctorTotal(lines: Pick<WorkLineRecord, "quantity" | "doctorUnitPrice">[]): number {
  return lines.reduce((sum, line) => sum + line.quantity * line.doctorUnitPrice, 0);
}

export function computeTechnicianTotal(
  lines: Pick<WorkLineRecord, "quantity" | "technicianUnitPrice">[],
): number {
  return lines.reduce((sum, line) => sum + line.quantity * line.technicianUnitPrice, 0);
}

export function buildWorkSummary(lines: Pick<WorkLineRecord, "quantity" | "workTypeName">[]): string {
  return lines.map((line) => `${line.quantity}× ${line.workTypeName}`).join(", ");
}

function listTechnicianColumns(lines: WorkLineRecord[]): {
  technician1Name: string | null;
  technician2Name: string | null;
  technician3Name: string | null;
} {
  const primary = lines[0];
  if (!primary) {
    return { technician1Name: null, technician2Name: null, technician3Name: null };
  }
  const fromLine = {
    technician1Name: primary.technicianName,
    technician2Name: primary.technician2Name,
    technician3Name: primary.technician3Name,
  };
  if (fromLine.technician1Name || fromLine.technician2Name || fromLine.technician3Name) {
    return fromLine;
  }
  const fallback = uniqueTechnicianNames(lines);
  return {
    technician1Name: fallback[0] ?? null,
    technician2Name: fallback[1] ?? null,
    technician3Name: fallback[2] ?? null,
  };
}

function toListRecord(work: WorkWithRelations): WorkListRecord {
  const lines = mapLines(work);
  const techColumns = listTechnicianColumns(lines);
  return {
    id: work.id,
    entryDate: work.entryDate,
    patientName: work.patientName,
    doctorName: work.doctor.name,
    observations: work.observations,
    paymentStatus: work.paymentStatus as PaymentStatus,
    doctorTotal: computeDoctorTotal(lines),
    technicianTotal: computeTechnicianTotal(lines),
    workSummary: buildWorkSummary(lines),
    ...techColumns,
  };
}

function toDetailRecord(work: WorkWithRelations): WorkDetailRecord {
  const lines = mapLines(work);
  return {
    id: work.id,
    entryDate: work.entryDate,
    patientName: work.patientName,
    observations: work.observations,
    paymentStatus: work.paymentStatus as PaymentStatus,
    doctorId: work.doctorId,
    doctorName: work.doctor.name,
    technician1Id: work.technician1Id,
    technician1Name: work.technician1?.name ?? null,
    technician2Id: work.technician2Id,
    technician2Name: work.technician2?.name ?? null,
    technician3Id: work.technician3Id,
    technician3Name: work.technician3?.name ?? null,
    lines,
    doctorTotal: computeDoctorTotal(lines),
    technicianTotal: computeTechnicianTotal(lines),
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
  };
}

const workInclude = {
  doctor: true,
  technician1: true,
  technician2: true,
  technician3: true,
  lines: {
    include: { workType: true, technician: true, technician2: true, technician3: true },
    orderBy: { createdAt: "asc" as const },
  },
};

function buildWhere(filters: SearchWorksFilters): Prisma.WorkWhereInput {
  const conditions: Prisma.WorkWhereInput[] = [];

  if (filters.doctorId) conditions.push({ doctorId: filters.doctorId });
  if (filters.patientName?.trim()) {
    conditions.push({ patientName: { contains: filters.patientName.trim() } });
  }
  if (filters.paymentStatus) conditions.push({ paymentStatus: filters.paymentStatus });

  const lineFilters: Prisma.WorkLineWhereInput[] = [];
  if (filters.technicianId) lineFilters.push({ technicianId: filters.technicianId });
  if (filters.technician2Id) lineFilters.push({ technician2Id: filters.technician2Id });
  if (filters.technician3Id) lineFilters.push({ technician3Id: filters.technician3Id });
  if (filters.workTypeId) lineFilters.push({ workTypeId: filters.workTypeId });
  if (lineFilters.length === 1) {
    conditions.push({ lines: { some: lineFilters[0] } });
  } else if (lineFilters.length > 1) {
    conditions.push({ lines: { some: { AND: lineFilters } } });
  }

  if (filters.keyword?.trim()) {
    const q = filters.keyword.trim();
    conditions.push({
      OR: [
        { patientName: { contains: q } },
        { observations: { contains: q } },
        { doctor: { name: { contains: q } } },
        { lines: { some: { workType: { name: { contains: q } } } } },
      ],
    });
  }

  const { from, to } = buildSearchDateRange(filters);
  if (from && to) {
    conditions.push({ entryDate: { gte: from, lte: to } });
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0]!;
  return { AND: conditions };
}

const SEARCH_MAX_RESULTS = 500;

export const worksRepository = {
  async findPage(
    params: { page: number; pageSize: number; month?: string },
    db: DbClient = getPrismaClient(),
  ): Promise<{ items: WorkListRecord[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, params.page);
    const pageSize = Math.min(200, Math.max(1, params.pageSize));
    const where = buildWhere(params.month ? { month: params.month } : {});

    const [total, rows] = await Promise.all([
      db.work.count({ where }),
      db.work.findMany({
        where,
        orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: workInclude,
      }),
    ]);

    return {
      items: rows.map(toListRecord),
      total,
      page,
      pageSize,
    };
  },

  async findAll(db: DbClient = getPrismaClient()): Promise<WorkListRecord[]> {
    const rows = await db.work.findMany({
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
      include: workInclude,
    });
    return rows.map(toListRecord);
  },

  async search(
    filters: SearchWorksFilters,
    options?: { unlimited?: boolean },
    db: DbClient = getPrismaClient(),
  ): Promise<{ items: WorkListRecord[]; total: number; truncated: boolean }> {
    const where = buildWhere(filters);
    const total = await db.work.count({ where });
    const rows = await db.work.findMany({
      where,
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
      ...(options?.unlimited ? {} : { take: SEARCH_MAX_RESULTS }),
      include: workInclude,
    });
    return {
      items: rows.map(toListRecord),
      total,
      truncated: !options?.unlimited && total > rows.length,
    };
  },

  async findById(id: string, db: DbClient = getPrismaClient()): Promise<WorkDetailRecord | null> {
    const row = await db.work.findUnique({ where: { id }, include: workInclude });
    return row ? toDetailRecord(row) : null;
  },

  async create(
    data: {
      entryDate: Date;
      patientName: string;
      observations: string | null;
      paymentStatus: PaymentStatus;
      doctorId: string;
      technician1Id: string | null;
      technician2Id: string | null;
      technician3Id: string | null;
      lines: {
        workTypeId: string;
        technicianId: string | null;
        technician2Id: string | null;
        technician3Id: string | null;
        quantity: number;
        doctorUnitPrice: number;
        technicianUnitPrice: number;
      }[];
    },
    db: DbClient = getPrismaClient(),
  ): Promise<WorkDetailRecord> {
    const row = await db.work.create({
      data: {
        entryDate: data.entryDate,
        patientName: data.patientName.trim(),
        observations: data.observations,
        paymentStatus: data.paymentStatus,
        doctorId: data.doctorId,
        technician1Id: data.technician1Id,
        technician2Id: data.technician2Id,
        technician3Id: data.technician3Id,
        lines: {
          create: data.lines.map((line) => ({
            workTypeId: line.workTypeId,
            technicianId: line.technicianId,
            technician2Id: line.technician2Id,
            technician3Id: line.technician3Id,
            quantity: line.quantity,
            doctorUnitPrice: line.doctorUnitPrice,
            technicianUnitPrice: line.technicianUnitPrice,
          })),
        },
      },
      include: workInclude,
    });
    return toDetailRecord(row);
  },

  async update(
    id: string,
    data: {
      entryDate: Date;
      patientName: string;
      observations: string | null;
      paymentStatus: PaymentStatus;
      doctorId: string;
      technician1Id: string | null;
      technician2Id: string | null;
      technician3Id: string | null;
      lines: {
        workTypeId: string;
        technicianId: string | null;
        technician2Id: string | null;
        technician3Id: string | null;
        quantity: number;
        doctorUnitPrice: number;
        technicianUnitPrice: number;
      }[];
    },
    db: DbClient = getPrismaClient(),
  ): Promise<WorkDetailRecord> {
    await db.workLine.deleteMany({ where: { workId: id } });
    const row = await db.work.update({
      where: { id },
      data: {
        entryDate: data.entryDate,
        patientName: data.patientName.trim(),
        observations: data.observations,
        paymentStatus: data.paymentStatus,
        doctorId: data.doctorId,
        technician1Id: data.technician1Id,
        technician2Id: data.technician2Id,
        technician3Id: data.technician3Id,
        lines: {
          create: data.lines.map((line) => ({
            workTypeId: line.workTypeId,
            technicianId: line.technicianId,
            technician2Id: line.technician2Id,
            technician3Id: line.technician3Id,
            quantity: line.quantity,
            doctorUnitPrice: line.doctorUnitPrice,
            technicianUnitPrice: line.technicianUnitPrice,
          })),
        },
      },
      include: workInclude,
    });
    return toDetailRecord(row);
  },

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    db: DbClient = getPrismaClient(),
  ): Promise<WorkDetailRecord> {
    const row = await db.work.update({
      where: { id },
      data: { paymentStatus },
      include: workInclude,
    });
    return toDetailRecord(row);
  },

  async deleteById(id: string, db: DbClient = getPrismaClient()): Promise<void> {
    await db.work.delete({ where: { id } });
  },
};
