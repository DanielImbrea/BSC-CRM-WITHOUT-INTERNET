import { Prisma } from "@prisma/client";
import { costsRepository, type CostRecord, type CostFilters } from "../infrastructure/costs-repository";
import { assertCostIsValid, type CostInput } from "../domain/cost-validation";
import { NotFoundError } from "../../../shared/errors";
import { recordAuditEvent } from "../../audit-log/application/record-audit-event";
import { AUDIT_ACTIONS } from "../../audit-log/domain/audit-action";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listCosts(filters: CostFilters): Promise<CostRecord[]> {
  requireAuthenticated();
  return costsRepository.findAll(filters);
}

export async function listCostCategories(): Promise<string[]> {
  requireAuthenticated();
  return costsRepository.listDistinctCategories();
}

export async function createCost(input: CostInput): Promise<CostRecord> {
  requireAuthenticated();
  assertCostIsValid(input);

  try {
    return await costsRepository.create(input);
  } catch (error) {
    // workId invalid -> constrângere de foreign key la scriere.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new NotFoundError("Work", input.workId ?? "");
    }
    throw error;
  }
}

export async function updateCost(id: string, input: CostInput): Promise<CostRecord> {
  requireAuthenticated();
  assertCostIsValid(input);
  const existing = await costsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("CostEntry", id);
  }

  try {
    return await costsRepository.update(id, input);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new NotFoundError("Work", input.workId ?? "");
    }
    throw error;
  }
}

export async function deleteCost(id: string): Promise<void> {
  requireAuthenticated();
  const existing = await costsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("CostEntry", id);
  }

  await costsRepository.delete(id);

  await recordAuditEvent({
    action: AUDIT_ACTIONS.DELETE,
    entityType: "CostEntry",
    entityId: id,
    before: existing,
  });
}
