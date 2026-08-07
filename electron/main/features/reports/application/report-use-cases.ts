import type { MonthReportRequest, MonthSummaryRequest } from "@shared-types/ipc";
import { getPrismaClient } from "../../../shared/db";
import { doctorsRepository } from "../../doctors/infrastructure/doctors-repository";
import { techniciansRepository } from "../../technicians/infrastructure/technicians-repository";
import { technicianRatesRepository } from "../../rates/infrastructure/technician-rates-repository";
import {
  buildWorkSummary,
  computeDoctorTotal,
  computeTechnicianTotal,
  worksRepository,
} from "../../works/infrastructure/works-repository";
import { parseMonthRange } from "../../works/domain/work-validation";
import { NotFoundError, ValidationError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

async function resolveTechnicianLineAmount(
  line: {
    technicianId: string | null;
    technician2Id: string | null;
    technician3Id: string | null;
    quantity: number;
    technicianUnitPrice: number;
    workTypeId: string;
    work: { doctorId: string };
  },
  technicianId: string,
): Promise<number> {
  const isPrimary = line.technicianId === technicianId;
  const isSecondary = line.technician2Id === technicianId || line.technician3Id === technicianId;
  if (!isPrimary && !isSecondary) return 0;

  if (isPrimary && line.technicianUnitPrice > 0) {
    return line.quantity * line.technicianUnitPrice;
  }

  const rate = await technicianRatesRepository.findPrice(
    technicianId,
    line.work.doctorId,
    line.workTypeId,
  );
  if (rate != null && rate > 0) {
    return line.quantity * rate;
  }

  if (isPrimary) {
    return line.quantity * line.technicianUnitPrice;
  }

  return 0;
}

function buildWorkTypeBreakdown(
  works: Array<{
    lines: Array<{ quantity: number; doctorUnitPrice: number; workTypeName: string }>;
  }>,
) {
  const totals = new Map<string, { quantity: number; amount: number }>();
  for (const work of works) {
    for (const line of work.lines) {
      const existing = totals.get(line.workTypeName) ?? { quantity: 0, amount: 0 };
      existing.quantity += line.quantity;
      existing.amount += line.quantity * line.doctorUnitPrice;
      totals.set(line.workTypeName, existing);
    }
  }
  return [...totals.entries()]
    .map(([workTypeName, data]) => ({ workTypeName, ...data }))
    .sort((a, b) => a.workTypeName.localeCompare(b.workTypeName, "ro"));
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

  const lines = worksWithLines.map((work) => ({
    workId: work.id,
    entryDate: work.entryDate.toISOString(),
    patientName: work.patientName,
    doctorName: work.doctor.name,
    workSummary: buildWorkSummary(
      work.lines.map((line) => ({ quantity: line.quantity, workTypeName: line.workType.name })),
    ),
    amount: computeDoctorTotal(
      work.lines.map((line) => ({
        quantity: line.quantity,
        doctorUnitPrice: line.doctorUnitPrice,
      })),
    ),
  }));

  const workTypeBreakdown = buildWorkTypeBreakdown(
    worksWithLines.map((work) => ({
      lines: work.lines.map((line) => ({
        quantity: line.quantity,
        doctorUnitPrice: line.doctorUnitPrice,
        workTypeName: line.workType.name,
      })),
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
    workTypeBreakdown,
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
    const technicianIds = [
      line.technicianId,
      line.technician2Id,
      line.technician3Id,
    ].filter((id): id is string => id !== null);

    const targets = payload.technicianId
      ? technicianIds.filter((id) => id === payload.technicianId)
      : technicianIds;

    for (const techId of targets) {
      const amount = await resolveTechnicianLineAmount(line, techId);
      if (amount <= 0) continue;

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

  const doctorPaidTotal = works.reduce((sum, work) => sum + computeDoctorTotal(work.lines), 0);

  const technicianPaidWorks = await db.work.findMany({
    where: {
      ...entryDateFilter,
      paymentStatus: "PLATITA_TEHNICIAN",
    },
    include: { lines: true },
  });

  const technicianPaidTotal = technicianPaidWorks.reduce(
    (sum, work) => sum + computeTechnicianTotal(work.lines),
    0,
  );

  return {
    month: payload.month ?? "",
    doctorPaidTotal,
    doctorPaidWorksCount: works.length,
    technicianPaidTotal,
    technicianPaidWorksCount: technicianPaidWorks.length,
  };
}
