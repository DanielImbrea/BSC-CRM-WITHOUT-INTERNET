import { Prisma } from "@prisma/client";
import { salariesRepository, type SalaryRecord, type SalaryFilters } from "../infrastructure/salaries-repository";
import { assertSalaryIsValid, computeNetAmount, type SalaryInput } from "../domain/salary-validation";
import { NotFoundError, ConflictError } from "../../../shared/errors";
import { recordAuditEvent } from "../../audit-log/application/record-audit-event";
import { AUDIT_ACTIONS } from "../../audit-log/domain/audit-action";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listSalaries(filters: SalaryFilters): Promise<SalaryRecord[]> {
  requireAuthenticated();
  return salariesRepository.findAll(filters);
}

export async function createSalary(input: SalaryInput): Promise<SalaryRecord> {
  requireAuthenticated();
  assertSalaryIsValid(input);
  const netAmount = computeNetAmount(input);

  let created: SalaryRecord;
  try {
    created = await salariesRepository.create(input, netAmount);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError(
          `Există deja un salariu înregistrat pentru acest angajat în perioada ${input.period}.`,
        );
      }
      if (error.code === "P2003") {
        throw new NotFoundError("Employee", input.employeeId);
      }
    }
    throw error;
  }

  await recordAuditEvent({
    action: AUDIT_ACTIONS.SALARY_CREATE,
    entityType: "SalaryEntry",
    entityId: created.id,
    after: created,
  });

  return created;
}

export async function updateSalary(id: string, input: SalaryInput): Promise<SalaryRecord> {
  requireAuthenticated();
  assertSalaryIsValid(input);
  const existing = await salariesRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("SalaryEntry", id);
  }

  const netAmount = computeNetAmount(input);

  let updated: SalaryRecord;
  try {
    updated = await salariesRepository.update(id, input, netAmount);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictError(
          `Există deja un salariu înregistrat pentru acest angajat în perioada ${input.period}.`,
        );
      }
      if (error.code === "P2003") {
        throw new NotFoundError("Employee", input.employeeId);
      }
    }
    throw error;
  }

  await recordAuditEvent({
    action: AUDIT_ACTIONS.SALARY_UPDATE,
    entityType: "SalaryEntry",
    entityId: id,
    before: existing,
    after: updated,
  });

  return updated;
}

export async function deleteSalary(id: string): Promise<void> {
  requireAuthenticated();
  const existing = await salariesRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("SalaryEntry", id);
  }

  await salariesRepository.delete(id);

  await recordAuditEvent({
    action: AUDIT_ACTIONS.DELETE,
    entityType: "SalaryEntry",
    entityId: id,
    before: existing,
  });
}
