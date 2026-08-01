import { Prisma } from "@prisma/client";
import { employeesRepository, type EmployeeRecord } from "../infrastructure/employees-repository";
import { assertEmployeeIsValid, type EmployeeInput } from "../domain/employee-validation";
import { NotFoundError, ConflictError } from "../../../shared/errors";
import { recordAuditEvent } from "../../audit-log/application/record-audit-event";
import { AUDIT_ACTIONS } from "../../audit-log/domain/audit-action";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listEmployees(): Promise<EmployeeRecord[]> {
  requireAuthenticated();
  return employeesRepository.findAll();
}

export async function createEmployee(input: EmployeeInput): Promise<EmployeeRecord> {
  requireAuthenticated();
  assertEmployeeIsValid(input);
  return employeesRepository.create(input);
}

export async function updateEmployee(id: string, input: EmployeeInput): Promise<EmployeeRecord> {
  requireAuthenticated();
  assertEmployeeIsValid(input);
  const existing = await employeesRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Employee", id);
  }
  return employeesRepository.update(id, input);
}

/**
 * Ștergerea unui angajat e blocată dacă are salarii înregistrate
 * (SalaryEntry.employee -> onDelete: Restrict) — istoricul de salarii
 * trebuie păstrat. Recomandarea în acest caz: dezactivează angajatul
 * (Active = false) în loc să-l ștergi.
 */
export async function deleteEmployee(id: string): Promise<void> {
  requireAuthenticated();
  const existing = await employeesRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Employee", id);
  }

  try {
    await employeesRepository.delete(id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2014")
    ) {
      throw new ConflictError(
        `Angajatul "${existing.name}" are salarii înregistrate și nu poate fi șters. Dezactivează-l în schimb.`,
      );
    }
    throw error;
  }

  await recordAuditEvent({
    action: AUDIT_ACTIONS.DELETE,
    entityType: "Employee",
    entityId: id,
    before: existing,
  });
}
