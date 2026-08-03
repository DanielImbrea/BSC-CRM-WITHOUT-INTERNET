import type { MonthReportRequest } from "@shared-types/ipc";
import { getPrismaClient } from "../../../shared/db";
import { doctorsRepository } from "../../doctors/infrastructure/doctors-repository";
import { techniciansRepository } from "../../technicians/infrastructure/technicians-repository";
import {
  buildWorkSummary,
  computeDoctorTotal,
  computeTechnicianTotal,
  worksRepository,
} from "../../works/infrastructure/works-repository";
import { parseMonthRange } from "../../works/domain/work-validation";
import { NotFoundError, ValidationError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

function technicianShare(workTechnicianTotal: number, assignedCount: number): number {
  if (assignedCount <= 0) return 0;
  return Math.round(workTechnicianTotal / assignedCount);
}

export async function getDoctorUnpaidReport(payload: MonthReportRequest) {
  requireAuthenticated();
  if (!payload.doctorId) {
    throw new ValidationError("Selectează un doctor pentru raport.");
  }
  const doctor = await doctorsRepository.findById(payload.doctorId);
  if (!doctor) throw new NotFoundError("Doctor", payload.doctorId);

  const { from, to } = parseMonthRange(payload.month);
  const works = await worksRepository.search({
    doctorId: payload.doctorId,
    paymentStatus: "NEPLATITA",
    month: payload.month,
  });

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
  const rows = await db.work.findMany({
    where: {
      paymentStatus: "PLATITA_DOCTOR",
      entryDate: { gte: from, lte: to },
      OR: [
        { technician1Id: payload.technicianId },
        { technician2Id: payload.technicianId },
        { technician3Id: payload.technicianId },
      ],
    },
    include: {
      doctor: true,
      lines: { include: { workType: true } },
    },
    orderBy: { entryDate: "asc" },
  });

  const lines = rows.map((work) => {
    const mappedLines = work.lines.map((line) => ({
      workTypeName: line.workType.name,
      quantity: line.quantity,
      doctorUnitPrice: line.doctorUnitPrice,
      technicianUnitPrice: line.technicianUnitPrice,
    }));
    const technicianTotal = computeTechnicianTotal(
      work.lines.map((line) => ({
        quantity: line.quantity,
        technicianUnitPrice: line.technicianUnitPrice,
      })),
    );
    const assigned = [work.technician1Id, work.technician2Id, work.technician3Id].filter(Boolean).length;
    return {
      workId: work.id,
      entryDate: work.entryDate.toISOString(),
      patientName: work.patientName,
      doctorName: work.doctor.name,
      workSummary: buildWorkSummary(
        mappedLines.map((line) => ({ quantity: line.quantity, workTypeName: line.workTypeName })),
      ),
      amount: technicianShare(technicianTotal, assigned),
    };
  });

  return {
    technicianName: technician.name,
    month: payload.month,
    lines,
    totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
  };
}
