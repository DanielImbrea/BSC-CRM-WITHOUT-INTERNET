import type { MonthReportRequest } from "@shared-types/ipc";
import { getPrismaClient } from "../../../shared/db";
import { doctorsRepository } from "../../doctors/infrastructure/doctors-repository";
import { techniciansRepository } from "../../technicians/infrastructure/technicians-repository";
import { technicianRatesRepository } from "../../rates/infrastructure/technician-rates-repository";
import { buildWorkSummary, computeDoctorTotal, computeTechnicianTotal, worksRepository } from "../../works/infrastructure/works-repository";
import { parseMonthRange } from "../../works/domain/work-validation";
import { NotFoundError, ValidationError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

async function technicianLineAmount(
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
  if (line.technicianId === technicianId) {
    return line.quantity * line.technicianUnitPrice;
  }
  if (line.technician2Id === technicianId || line.technician3Id === technicianId) {
    const rate = await technicianRatesRepository.findPrice(
      technicianId,
      line.work.doctorId,
      line.workTypeId,
    );
    return line.quantity * (rate ?? 0);
  }
  return 0;
}

export async function getDoctorUnpaidReport(payload: MonthReportRequest) {
  requireAuthenticated();
  if (!payload.doctorId) {
    throw new ValidationError("Selectează un doctor pentru raport.");
  }
  const doctor = await doctorsRepository.findById(payload.doctorId);
  if (!doctor) throw new NotFoundError("Doctor", payload.doctorId);

  const { from, to } = parseMonthRange(payload.month);
  const { items: works } = await worksRepository.search(
    {
      doctorId: payload.doctorId,
      paymentStatus: "NEPLATITA",
      month: payload.month,
    },
    { unlimited: true },
  );

  const lines = works
    .filter((work) => work.entryDate >= from && work.entryDate <= to)
    .map((work) => ({
      workId: work.id,
      entryDate: work.entryDate.toISOString(),
      patientName: work.patientName,
      workSummary: work.workSummary,
      amount: work.doctorTotal,
    }));

  return {
    doctorName: doctor.name,
    month: payload.month,
    lines,
    totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
  };
}

export async function getTechnicianSalaryReport(payload: MonthReportRequest) {
  requireAuthenticated();
  if (!payload.technicianId) {
    throw new ValidationError("Selectează un tehnician pentru raport.");
  }
  const technician = await techniciansRepository.findById(payload.technicianId);
  if (!technician) throw new NotFoundError("Technician", payload.technicianId);

  const { from, to } = parseMonthRange(payload.month);
  const db = getPrismaClient();

  const workLines = await db.workLine.findMany({
    where: {
      OR: [
        { technicianId: payload.technicianId },
        { technician2Id: payload.technicianId },
        { technician3Id: payload.technicianId },
      ],
      work: {
        paymentStatus: "PLATITA_DOCTOR",
        entryDate: { gte: from, lte: to },
      },
    },
    include: {
      workType: true,
      work: { include: { doctor: true } },
    },
    orderBy: { work: { entryDate: "asc" } },
  });

  const lines = await Promise.all(
    workLines.map(async (line) => {
      const amount = await technicianLineAmount(line, payload.technicianId!);
      const lineDetail = `${line.quantity}× ${line.workType.name}`;
      return {
        workId: line.workId,
        entryDate: line.work.entryDate.toISOString(),
        patientName: line.work.patientName,
        doctorName: line.work.doctor.name,
        workSummary: lineDetail,
        lineDetail,
        amount,
      };
    }),
  );

  return {
    technicianName: technician.name,
    month: payload.month,
    lines,
    totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
  };
}

export async function getMonthSummaryReport(payload: { month: string }) {
  requireAuthenticated();
  if (!payload.month) {
    throw new ValidationError("Selectează luna pentru rezumat.");
  }

  const { from, to } = parseMonthRange(payload.month);
  const db = getPrismaClient();

  const works = await db.work.findMany({
    where: {
      entryDate: { gte: from, lte: to },
      paymentStatus: { in: ["PLATITA_DOCTOR", "PLATITA_TEHNICIAN"] },
    },
    include: { lines: true },
  });

  const doctorPaidTotal = works.reduce((sum, work) => sum + computeDoctorTotal(work.lines), 0);

  const technicianPaidWorks = await db.work.findMany({
    where: {
      entryDate: { gte: from, lte: to },
      paymentStatus: "PLATITA_TEHNICIAN",
    },
    include: { lines: true },
  });

  const technicianPaidTotal = technicianPaidWorks.reduce(
    (sum, work) => sum + computeTechnicianTotal(work.lines),
    0,
  );

  return {
    month: payload.month,
    doctorPaidTotal,
    doctorPaidWorksCount: works.length,
    technicianPaidTotal,
    technicianPaidWorksCount: technicianPaidWorks.length,
  };
}
