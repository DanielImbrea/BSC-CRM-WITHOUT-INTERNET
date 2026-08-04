import { Prisma } from "../../../shared/prisma";
import type { ListWorksRequest, PaymentStatus, SearchWorksFilters } from "@shared-types/ipc";
import { getPrismaClient } from "../../../shared/db";
import {
  worksRepository,
  type WorkDetailRecord,
  type WorkListRecord,
} from "../infrastructure/works-repository";
import { assertPaymentStatus, assertWorkIsValid, type WorkInput } from "../domain/work-validation";
import { NotFoundError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

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

function toPersistence(input: WorkInput) {
  return {
    entryDate: input.entryDate,
    patientName: input.patientName,
    observations: input.observations?.trim() || null,
    paymentStatus: input.paymentStatus,
    doctorId: input.doctorId,
    technician1Id: null,
    technician2Id: null,
    technician3Id: null,
    lines: input.lines.map((line) => ({
      workTypeId: line.workTypeId,
      technicianId: line.technicianId ?? null,
      technician2Id: line.technician2Id ?? null,
      technician3Id: line.technician3Id ?? null,
      quantity: line.quantity,
      doctorUnitPrice: line.doctorUnitPrice,
      technicianUnitPrice: line.technicianUnitPrice,
    })),
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
    return await worksRepository.create(toPersistence(normalized), db);
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
  return worksRepository.update(id, toPersistence(normalized));
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
