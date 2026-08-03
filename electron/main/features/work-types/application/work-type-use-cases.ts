import { Prisma } from "@prisma/client";
import { workTypesRepository, type WorkTypeRecord } from "../infrastructure/work-types-repository";
import { assertWorkTypeIsValid, type WorkTypeInput } from "../domain/work-type-validation";
import { NotFoundError, ConflictError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listWorkTypes(): Promise<WorkTypeRecord[]> {
  requireAuthenticated();
  return workTypesRepository.findAll();
}

export async function createWorkType(input: WorkTypeInput): Promise<WorkTypeRecord> {
  requireAuthenticated();
  assertWorkTypeIsValid(input);
  return workTypesRepository.create(input);
}

export async function updateWorkType(id: string, input: WorkTypeInput): Promise<WorkTypeRecord> {
  requireAuthenticated();
  assertWorkTypeIsValid(input);
  if (!(await workTypesRepository.findById(id))) throw new NotFoundError("WorkType", id);
  return workTypesRepository.update(id, input);
}

export async function deleteWorkType(id: string): Promise<void> {
  requireAuthenticated();
  if (!(await workTypesRepository.findById(id))) throw new NotFoundError("WorkType", id);
  try {
    await workTypesRepository.delete(id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2014")
    ) {
      throw new ConflictError("Tipul de lucrare este folosit în lucrări existente și nu poate fi șters.");
    }
    throw error;
  }
}
