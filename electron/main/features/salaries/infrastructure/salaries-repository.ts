import { getPrismaClient, type DbClient } from "../../../shared/db";
import type { SalaryInput } from "../domain/salary-validation";

export interface SalaryFilters {
  employeeId?: string;
  period?: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseAmount: number;
  bonuses: number;
  deductions: number;
  netAmount: number;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function toRecord(row: {
  id: string;
  employeeId: string;
  employee: { name: string };
  period: string;
  baseAmount: number;
  bonuses: number;
  deductions: number;
  netAmount: number;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SalaryRecord {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeName: row.employee.name,
    period: row.period,
    baseAmount: row.baseAmount,
    bonuses: row.bonuses,
    deductions: row.deductions,
    netAmount: row.netAmount,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const salariesRepository = {
  async findAll(filters: SalaryFilters = {}, db: DbClient = getPrismaClient()): Promise<SalaryRecord[]> {
    const rows = await db.salaryEntry.findMany({
      where: {
        employeeId: filters.employeeId,
        period: filters.period,
      },
      orderBy: [{ period: "desc" }, { employee: { name: "asc" } }],
      include: { employee: { select: { name: true } } },
    });
    return rows.map(toRecord);
  },

  async findById(id: string, db: DbClient = getPrismaClient()): Promise<SalaryRecord | null> {
    const row = await db.salaryEntry.findUnique({
      where: { id },
      include: { employee: { select: { name: true } } },
    });
    return row ? toRecord(row) : null;
  },

  async findByEmployeeAndPeriod(
    employeeId: string,
    period: string,
    db: DbClient = getPrismaClient(),
  ): Promise<SalaryRecord | null> {
    const row = await db.salaryEntry.findUnique({
      where: { employeeId_period: { employeeId, period } },
      include: { employee: { select: { name: true } } },
    });
    return row ? toRecord(row) : null;
  },

  async create(
    input: SalaryInput,
    netAmount: number,
    db: DbClient = getPrismaClient(),
  ): Promise<SalaryRecord> {
    const row = await db.salaryEntry.create({
      data: {
        employeeId: input.employeeId,
        period: input.period,
        baseAmount: input.baseAmount,
        bonuses: input.bonuses,
        deductions: input.deductions,
        netAmount,
        paidAt: input.paidAt ?? null,
      },
      include: { employee: { select: { name: true } } },
    });
    return toRecord(row);
  },

  async update(
    id: string,
    input: SalaryInput,
    netAmount: number,
    db: DbClient = getPrismaClient(),
  ): Promise<SalaryRecord> {
    const row = await db.salaryEntry.update({
      where: { id },
      data: {
        employeeId: input.employeeId,
        period: input.period,
        baseAmount: input.baseAmount,
        bonuses: input.bonuses,
        deductions: input.deductions,
        netAmount,
        paidAt: input.paidAt ?? null,
      },
      include: { employee: { select: { name: true } } },
    });
    return toRecord(row);
  },

  async delete(id: string, db: DbClient = getPrismaClient()): Promise<void> {
    await db.salaryEntry.delete({ where: { id } });
  },
};
