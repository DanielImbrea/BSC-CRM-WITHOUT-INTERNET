import { Prisma } from "../../../shared/prisma";
import type { ListWorksRequest, PaymentStatus, SearchWorksFilters } from "@shared-types/ipc";
import { getPrismaClient } from "../../../shared/db";
import {
  worksRepository,
  type WorkDetailRecord,
  type WorkListRecord,
} from "../infrastructure/works-repository";
import { assertPaymentStatus, assertWorkIsValid, type WorkInput, type WorkLineInput } from "../domain/work-validation";
import { NotFoundError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";
import { technicianRatesRepository } from "../../rates/infrastructure/technician-rates-repository";

async function lookupTechnicianUnitPrice(
  doctorId: string,
  workTypeId: string,
  technicianId: string,
): Promise<number> {
  const rate = await technicianRatesRepository.findPrice(technicianId, doctorId, workTypeId);
  return rate ?? 0;
}

async function resolveLineTechnicianPrices(
  doctorId: string,
  line: WorkLineInput,
): Promise<{
  technicianUnitPrice: number;
  technician2UnitPrice: number;
  technician3UnitPrice: number;
}> {
  let technicianUnitPrice = line.technicianUnitPrice;
  if (line.technicianId && technicianUnitPrice === 0) {
    technicianUnitPrice = await lookupTechnicianUnitPrice(doctorId, line.workTypeId, line.technicianId);
  }

  let technician2UnitPrice = 0;
  if (line.technician2Id) {
    technician2UnitPrice =
      line.technician2UnitPrice && line.technician2UnitPrice > 0
        ? line.technician2UnitPrice
        : await lookupTechnicianUnitPrice(doctorId, line.workTypeId, line.technician2Id);
  }

  let technician3UnitPrice = 0;
  if (line.technician3Id) {
    technician3UnitPrice =
      line.technician3UnitPrice && line.technician3UnitPrice > 0
        ? line.technician3UnitPrice
        : await lookupTechnicianUnitPrice(doctorId, line.workTypeId, line.technician3Id);
  }

  return { technicianUnitPrice, technician2UnitPrice, technician3UnitPrice };
}

function normalizeWorkInput(input: Omit<WorkInput, "entryDate"> & { entryDate: string | Date }): WorkInput {
  return {
    ...input,
    entryDate: input.entryDate instanceof Date ? input.entryDate : new Date(input.entryDate),
    observations: input.observations?.trim() || undefined,
    technician1Id: input.technician1Id || undefined,
    technician2Id: input.technician2Id || undefined,
    technician3Id: input.technician3Id || undefined,
  };
}

async function toPersistence(input: WorkInput) {
  const lines = await Promise.all(
    input.lines.map(async (line) => {
      const prices = await resolveLineTechnicianPrices(input.doctorId, line);
      return {
        workTypeId: line.workTypeId,
        technicianId: line.technicianId ?? null,
        technician2Id: line.technician2Id ?? null,
        technician3Id: line.technician3Id ?? null,
        quantity: line.quantity,
        doctorUnitPrice: line.doctorUnitPrice,
        ...prices,
      };
    }),
  );

  return {
    entryDate: input.entryDate,
    patientName: input.patientName,
    observations: input.observations?.trim() || null,
    paymentStatus: input.paymentStatus,
    doctorId: input.doctorId,
    technician1Id: null,
    technician2Id: null,
    technician3Id: null,
    lines,
  };
}

export async function listWorks(params: ListWorksRequest = {}): Promise<{
  items: WorkListRecord[];
  total: number;
  page: number;
  pageSize: number;
}> {
  requireAuthenticated();
  return worksRepository.findPage({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
    month: params.month,
  });
}

export async function searchWorks(filters: SearchWorksFilters): Promise<{
  items: WorkListRecord[];
  total: number;
  truncated: boolean;
}> {
  requireAuthenticated();
  return worksRepository.search(filters);
}

export async function getWork(id: string): Promise<WorkDetailRecord> {
  requireAuthenticated();
  const work = await worksRepository.findById(id);
  if (!work) throw new NotFoundError("Work", id);
  return work;
}

export async function createWork(
  input: Omit<WorkInput, "entryDate"> & { entryDate: string; paymentStatus?: PaymentStatus },
): Promise<WorkDetailRecord> {
  requireAuthenticated();
  const normalized = normalizeWorkInput({
    ...input,
    paymentStatus: input.paymentStatus ?? "NEPLATITA",
  });
  assertWorkIsValid(normalized);

  const db = getPrismaClient();
  try {
    return await worksRepository.create(await toPersistence(normalized), db);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new NotFoundError("Entitate", "referință invalidă");
    }
    throw error;
  }
}

export async function updateWork(
  id: string,
  input: Omit<WorkInput, "entryDate"> & { entryDate: string },
): Promise<WorkDetailRecord> {
  requireAuthenticated();
  const normalized = normalizeWorkInput(input);
  assertWorkIsValid(normalized);
  if (!(await worksRepository.findById(id))) throw new NotFoundError("Work", id);
  return worksRepository.update(id, await toPersistence(normalized));
}

export async function updateWorkPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
): Promise<WorkDetailRecord> {
  requireAuthenticated();
  assertPaymentStatus(paymentStatus);
  if (!(await worksRepository.findById(id))) throw new NotFoundError("Work", id);
  return worksRepository.updatePaymentStatus(id, paymentStatus);
}

export async function deleteWork(id: string): Promise<void> {
  requireAuthenticated();
  if (!(await worksRepository.findById(id))) throw new NotFoundError("Work", id);
  await worksRepository.deleteById(id);
}
