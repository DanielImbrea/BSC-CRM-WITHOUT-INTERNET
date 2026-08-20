import type { MonthReportRequest, MonthSummaryRequest } from "@shared-types/ipc";
import { getPrismaClient } from "../../../shared/db";
import { doctorsRepository } from "../../doctors/infrastructure/doctors-repository";
import { techniciansRepository } from "../../technicians/infrastructure/technicians-repository";
import { technicianRatesRepository } from "../../rates/infrastructure/technician-rates-repository";
import { doctorRatesRepository } from "../../rates/infrastructure/doctor-rates-repository";
import {
  buildWorkSummary,
  worksRepository,
} from "../../works/infrastructure/works-repository";
import { parseMonthRange } from "../../works/domain/work-validation";
import { NotFoundError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

type SalaryWorkLine = {
  technicianId: string | null;
  technician2Id: string | null;
  technician3Id: string | null;
  quantity: number;
  technicianUnitPrice: number;
  technician2UnitPrice: number;
  technician3UnitPrice: number;
  workTypeId: string;
  work: { doctorId: string };
};

function storedUnitPriceForTechnician(line: SalaryWorkLine, technicianId: string): number {
  if (line.technicianId === technicianId) return line.technicianUnitPrice;
  if (line.technician2Id === technicianId) return line.technician2UnitPrice;
  if (line.technician3Id === technicianId) return line.technician3UnitPrice;
  return 0;
}

async function resolveTechnicianUnitPrice(
  technicianId: string,
  doctorId: string,
  workTypeId: string,
  storedUnitPrice: number,
): Promise<number> {
  if (storedUnitPrice > 0) return storedUnitPrice;
  const rate = await technicianRatesRepository.findPrice(technicianId, doctorId, workTypeId);
  return rate ?? 0;
}

async function resolveTechnicianLineAmount(
  line: SalaryWorkLine,
  technicianId: string,
): Promise<number> {
  const isAssigned =
    line.technicianId === technicianId ||
    line.technician2Id === technicianId ||
    line.technician3Id === technicianId;
  if (!isAssigned) return 0;

  const storedPrice = storedUnitPriceForTechnician(line, technicianId);
  const unitPrice = await resolveTechnicianUnitPrice(
    technicianId,
    line.work.doctorId,
    line.workTypeId,
    storedPrice,
  );
  return line.quantity * unitPrice;
}

async function resolveDoctorLineAmount(
  doctorId: string,
  line: { quantity: number; doctorUnitPrice: number; workTypeId: string },
): Promise<number> {
  let unitPrice = line.doctorUnitPrice;
  if (unitPrice <= 0) {
    const rate = await doctorRatesRepository.findPrice(doctorId, line.workTypeId);
    unitPrice = rate ?? 0;
  }
  return line.quantity * unitPrice;
}

async function computeWorkTechnicianPay(
  doctorId: string,
  line: {
    technicianId: string | null;
    technician2Id: string | null;
    technician3Id: string | null;
    quantity: number;
    technicianUnitPrice: number;
    technician2UnitPrice: number;
    technician3UnitPrice: number;
    workTypeId: string;
  },
): Promise<number> {
  const slots = [
    { id: line.technicianId, stored: line.technicianUnitPrice },
    { id: line.technician2Id, stored: line.technician2UnitPrice },
    { id: line.technician3Id, stored: line.technician3UnitPrice },
  ];

  let total = 0;
  for (const slot of slots) {
    if (!slot.id) continue;
    const unitPrice = await resolveTechnicianUnitPrice(
      slot.id,
      doctorId,
      line.workTypeId,
      slot.stored,
    );
    total += line.quantity * unitPrice;
  }
  return total;
}

export async function getDoctorUnpaidReport(payload: MonthReportRequest) {
  requireAuthenticated();

  if (payload.doctorId) {
    const doctor = await doctorsRepository.findById(payload.doctorId);
    if (!doctor) throw new NotFoundError("Doctor", payload.doctorId);
  }

  const { items: works } = await worksRepository.search(
    {
      ...(payload.doctorId ? { doctorId: payload.doctorId } : {}),
      ...(payload.paymentStatus ? { paymentStatus: payload.paymentStatus } : {}),
      ...(payload.month ? { month: payload.month } : {}),
    },
    { unlimited: true },
  );

  const db = getPrismaClient();
  const workIds = works.map((w) => w.id);
  const worksWithLines =
    workIds.length > 0
      ? await db.work.findMany({
          where: { id: { in: workIds } },
          include: {
            doctor: true,
            lines: { include: { workType: true }, orderBy: { createdAt: "asc" } },
          },
          orderBy: { entryDate: "asc" },
        })
      : [];

  const lines = await Promise.all(
    worksWithLines.map(async (work) => ({
      workId: work.id,
      entryDate: work.entryDate.toISOString(),
      patientName: work.patientName,
      doctorName: work.doctor.name,
      workSummary: buildWorkSummary(
        work.lines.map((line) => ({ quantity: line.quantity, workTypeName: line.workType.name })),
      ),
      amount: (
        await Promise.all(
          work.lines.map((line) => resolveDoctorLineAmount(work.doctorId, line)),
        )
      ).reduce((sum, value) => sum + value, 0),
    })),
  );

  let doctorName = "Toți doctorii";
  if (payload.doctorId) {
    const doctor = await doctorsRepository.findById(payload.doctorId);
    doctorName = doctor!.name;
  }

  return {
    doctorName,
    month: payload.month ?? "",
    paymentStatus: payload.paymentStatus,
    lines,
    totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
  };
}

export async function getTechnicianSalaryReport(payload: MonthReportRequest) {
  requireAuthenticated();

  if (payload.technicianId) {
    const technician = await techniciansRepository.findById(payload.technicianId);
    if (!technician) throw new NotFoundError("Technician", payload.technicianId);
  }

  const dateFilter = payload.month ? parseMonthRange(payload.month) : null;
  const db = getPrismaClient();

  const paymentFilter = payload.paymentStatus ? { paymentStatus: payload.paymentStatus } : {};

  const technicianFilter = payload.technicianId
    ? {
        OR: [
          { technicianId: payload.technicianId },
          { technician2Id: payload.technicianId },
          { technician3Id: payload.technicianId },
        ],
      }
    : {
        OR: [
          { technicianId: { not: null } },
          { technician2Id: { not: null } },
          { technician3Id: { not: null } },
        ],
      };

  const workLines = await db.workLine.findMany({
    where: {
      ...technicianFilter,
      work: {
        ...paymentFilter,
        ...(dateFilter ? { entryDate: { gte: dateFilter.from, lte: dateFilter.to } } : {}),
      },
    },
    include: {
      workType: true,
      technician: true,
      technician2: true,
      technician3: true,
      work: { include: { doctor: true } },
    },
    orderBy: { work: { entryDate: "asc" } },
  });

  const technicianNameCache = new Map<string, string>();

  async function resolveTechnicianName(id: string): Promise<string> {
    const cached = technicianNameCache.get(id);
    if (cached) return cached;
    const row = await techniciansRepository.findById(id);
    const name = row?.name ?? "—";
    technicianNameCache.set(id, name);
    return name;
  }

  const lineResults: Array<{
    workId: string;
    entryDate: string;
    patientName: string;
    doctorName: string;
    technicianName: string;
    workSummary: string;
    lineDetail: string;
    amount: number;
  }> = [];

  for (const line of workLines) {
    const technicianIds = [line.technicianId, line.technician2Id, line.technician3Id].filter(
      (id): id is string => id !== null,
    );

    const targets = payload.technicianId
      ? technicianIds.filter((id) => id === payload.technicianId)
      : technicianIds;

    for (const techId of targets) {
      const amount = await resolveTechnicianLineAmount(line, techId);

      lineResults.push({
        workId: line.workId,
        entryDate: line.work.entryDate.toISOString(),
        patientName: line.work.patientName,
        doctorName: line.work.doctor.name,
        technicianName: await resolveTechnicianName(techId),
        workSummary: `${line.quantity}× ${line.workType.name}`,
        lineDetail: `${line.quantity}× ${line.workType.name}`,
        amount,
      });
    }
  }

  let technicianName = "Toți tehnicienii";
  if (payload.technicianId) {
    const technician = await techniciansRepository.findById(payload.technicianId);
    technicianName = technician!.name;
  }

  return {
    technicianName,
    month: payload.month ?? "",
    paymentStatus: payload.paymentStatus,
    lines: lineResults,
    totalAmount: lineResults.reduce((sum, line) => sum + line.amount, 0),
  };
}

export async function getMonthSummaryReport(payload: MonthSummaryRequest) {
  requireAuthenticated();

  const dateFilter = payload.month ? parseMonthRange(payload.month) : null;
  const entryDateFilter = dateFilter
    ? { entryDate: { gte: dateFilter.from, lte: dateFilter.to } }
    : {};

  const db = getPrismaClient();

  const works = await db.work.findMany({
    where: {
      ...entryDateFilter,
      paymentStatus: { in: ["PLATITA_DOCTOR", "PLATITA_TEHNICIAN"] },
    },
    include: { lines: true },
  });

  const doctorPaidTotal = (
    await Promise.all(
      works.map(async (work) => {
        let workTotal = 0;
        for (const line of work.lines) {
          workTotal += await resolveDoctorLineAmount(work.doctorId, line);
        }
        return workTotal;
      }),
    )
  ).reduce((sum, value) => sum + value, 0);

  const technicianPaidWorks = await db.work.findMany({
    where: {
      ...entryDateFilter,
      paymentStatus: "PLATITA_TEHNICIAN",
    },
    include: { lines: true },
  });

  const technicianPaidTotal = (
    await Promise.all(
      technicianPaidWorks.map(async (work) => {
        let workTotal = 0;
        for (const line of work.lines) {
          workTotal += await computeWorkTechnicianPay(work.doctorId, line);
        }
        return workTotal;
      }),
    )
  ).reduce((sum, value) => sum + value, 0);

  return {
    month: payload.month ?? "",
    doctorPaidTotal,
    doctorPaidWorksCount: works.length,
    technicianPaidTotal,
    technicianPaidWorksCount: technicianPaidWorks.length,
  };
}
