import type { Prisma } from "prisma-client";
import type { PaymentStatus, SearchWorksFilters } from "@shared-types/ipc";
import { getPrismaClient, type DbClient } from "../../../shared/db";
import { buildSearchDateRange } from "../domain/work-validation";

export interface WorkLineRecord {
  id: string;
  workTypeId: string;
  workTypeName: string;
  quantity: number;
  doctorUnitPrice: number;
  technicianUnitPrice: number;
}

export interface WorkListRecord {
  id: string;
  entryDate: Date;
  patientName: string;
  doctorName: string;
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
    lines: { include: { workType: true } };
  };
}>;

function mapLines(work: WorkWithRelations): WorkLineRecord[] {
  return work.lines.map((line) => ({
    id: line.id,
    workTypeId: line.workTypeId,
    workTypeName: line.workType.name,
    quantity: line.quantity,
    doctorUnitPrice: line.doctorUnitPrice,
    technicianUnitPrice: line.technicianUnitPrice,
  }));
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

function toListRecord(work: WorkWithRelations): WorkListRecord {
  const lines = mapLines(work);
  return {
    id: work.id,
    entryDate: work.entryDate,
    patientName: work.patientName,
    doctorName: work.doctor.name,
    paymentStatus: work.paymentStatus as PaymentStatus,
    doctorTotal: computeDoctorTotal(lines),
    technicianTotal: computeTechnicianTotal(lines),
    workSummary: buildWorkSummary(lines),
    technician1Name: work.technician1?.name ?? null,
    technician2Name: work.technician2?.name ?? null,
    technician3Name: work.technician3?.name ?? null,
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
  lines: { include: { workType: true }, orderBy: { createdAt: "asc" as const } },
};

function buildWhere(filters: SearchWorksFilters): Prisma.WorkWhereInput {
  const where: Prisma.WorkWhereInput = {};
  if (filters.doctorId) where.doctorId = filters.doctorId;
  if (filters.patientName?.trim()) {
    where.patientName = { contains: filters.patientName.trim() };
  }
  if (filters.technician1Id) where.technician1Id = filters.technician1Id;
  if (filters.technician2Id) where.technician2Id = filters.technician2Id;
  if (filters.technician3Id) where.technician3Id = filters.technician3Id;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
  const { from, to } = buildSearchDateRange(filters);
  if (from && to) {
    where.entryDate = { gte: from, lte: to };
  }
  return where;
}

export const worksRepository = {
  async findAll(db: DbClient = getPrismaClient()): Promise<WorkListRecord[]> {
    const rows = await db.work.findMany({
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
      include: workInclude,
    });
    return rows.map(toListRecord);
  },

  async search(filters: SearchWorksFilters, db: DbClient = getPrismaClient()): Promise<WorkListRecord[]> {
    const rows = await db.work.findMany({
      where: buildWhere(filters),
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
      include: workInclude,
    });
    return rows.map(toListRecord);
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
        lines: { create: data.lines },
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
        lines: { create: data.lines },
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
