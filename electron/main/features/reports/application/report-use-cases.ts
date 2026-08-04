import type { MonthReportRequest } from "@shared-types/ipc";
import { getPrismaClient } from "../../../shared/db";
import { doctorsRepository } from "../../doctors/infrastructure/doctors-repository";
import { techniciansRepository } from "../../technicians/infrastructure/technicians-repository";
import { buildWorkSummary, worksRepository } from "../../works/infrastructure/works-repository";
import { parseMonthRange } from "../../works/domain/work-validation";
import { NotFoundError, ValidationError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

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

  const workLines = await db.workLine.findMany({
    where: {
      technicianId: payload.technicianId,
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

  const lines = workLines.map((line) => {
    const amount = line.quantity * line.technicianUnitPrice;
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
  });

  return {
    technicianName: technician.name,
    month: payload.month,
    lines,
    totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
  };
}
