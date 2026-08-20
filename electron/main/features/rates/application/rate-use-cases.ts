import type {
  DoctorRateRow,
  LookupLinePricesRequest,
  LookupLinePricesResponse,
  RateGridCell,
  SaveDoctorRatesRequest,
  SaveTechnicianRatesRequest,
  TechnicianRatesGrid,
} from "@shared-types/ipc";
import { getPrismaClient } from "../../../shared/db";
import { NotFoundError, ValidationError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";
import { doctorsRepository } from "../../doctors/infrastructure/doctors-repository";
import { techniciansRepository } from "../../technicians/infrastructure/technicians-repository";
import { doctorRatesRepository } from "../infrastructure/doctor-rates-repository";
import { technicianRatesRepository } from "../infrastructure/technician-rates-repository";

export async function getDoctorRates(doctorId: string): Promise<DoctorRateRow[]> {
  requireAuthenticated();
  if (!(await doctorsRepository.findById(doctorId))) {
    throw new NotFoundError("Doctor", doctorId);
  }

  const db = getPrismaClient();
  const workTypes = await db.workType.findMany({ orderBy: { name: "asc" } });
  const rates = await doctorRatesRepository.listByDoctor(doctorId);
  const rateMap = new Map(rates.map((r) => [r.workTypeId, r.pricePerUnit]));

  return workTypes.map((wt) => ({
    workTypeId: wt.id,
    workTypeName: wt.name,
    pricePerUnit: rateMap.get(wt.id) ?? null,
  }));
}

export async function saveDoctorRates(payload: SaveDoctorRatesRequest): Promise<void> {
  requireAuthenticated();
  if (!(await doctorsRepository.findById(payload.doctorId))) {
    throw new NotFoundError("Doctor", payload.doctorId);
  }

  for (const cell of payload.rates) {
    if (cell.pricePerUnit === null) {
      await doctorRatesRepository.delete(payload.doctorId, cell.workTypeId);
    } else if (!Number.isInteger(cell.pricePerUnit) || cell.pricePerUnit < 0) {
      throw new ValidationError("Preț invalid în grila doctorului.");
    } else {
      await doctorRatesRepository.upsert(payload.doctorId, cell.workTypeId, cell.pricePerUnit);
    }
  }
}

export async function getTechnicianRates(technicianId: string): Promise<TechnicianRatesGrid> {
  requireAuthenticated();
  const technician = await techniciansRepository.findById(technicianId);
  if (!technician) throw new NotFoundError("Technician", technicianId);

  const db = getPrismaClient();
  const [doctors, workTypes, rates] = await Promise.all([
    db.doctor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.workType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    technicianRatesRepository.listByTechnician(technicianId),
  ]);

  const prices: Record<string, number> = {};
  for (const rate of rates) {
    prices[`${rate.doctorId}:${rate.workTypeId}`] = rate.pricePerUnit;
  }

  return {
    technicianId,
    doctors,
    workTypes,
    prices,
  };
}

export async function saveTechnicianRates(payload: SaveTechnicianRatesRequest): Promise<void> {
  requireAuthenticated();
  if (!(await techniciansRepository.findById(payload.technicianId))) {
    throw new NotFoundError("Technician", payload.technicianId);
  }

  for (const cell of payload.rates) {
    if (cell.pricePerUnit === null) {
      await technicianRatesRepository.delete(
        payload.technicianId,
        cell.doctorId,
        cell.workTypeId,
      );
    } else if (!Number.isInteger(cell.pricePerUnit) || cell.pricePerUnit < 0) {
      throw new ValidationError("Preț invalid în grila tehnicianului.");
    } else {
      await technicianRatesRepository.upsert(
        payload.technicianId,
        cell.doctorId,
        cell.workTypeId,
        cell.pricePerUnit,
      );
    }
  }
}

export async function lookupLinePrices(
  payload: LookupLinePricesRequest,
): Promise<LookupLinePricesResponse> {
  requireAuthenticated();

  const db = getPrismaClient();
  const workType = await db.workType.findUnique({ where: { id: payload.workTypeId } });
  if (!workType) throw new NotFoundError("WorkType", payload.workTypeId);

  const doctorRate = await doctorRatesRepository.findPrice(payload.doctorId, payload.workTypeId);
  const doctorUnitPrice = doctorRate ?? 0;
  const doctorFromRate = doctorRate !== null;

  let technicianUnitPrice = 0;
  let technicianFromRate = false;
  if (payload.technicianId) {
    const techRate = await technicianRatesRepository.findPrice(
      payload.technicianId,
      payload.doctorId,
      payload.workTypeId,
    );
    if (techRate !== null) {
      technicianUnitPrice = techRate;
      technicianFromRate = true;
    }
  }

  return { doctorUnitPrice, technicianUnitPrice, doctorFromRate, technicianFromRate };
}
