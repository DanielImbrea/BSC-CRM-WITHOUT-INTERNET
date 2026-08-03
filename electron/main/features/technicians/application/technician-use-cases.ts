import { techniciansRepository, type TechnicianRecord } from "../infrastructure/technicians-repository";
import { assertTechnicianIsValid, type TechnicianInput } from "../domain/technician-validation";
import { NotFoundError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listTechnicians(): Promise<TechnicianRecord[]> {
  requireAuthenticated();
  return techniciansRepository.findAll();
}

export async function createTechnician(input: TechnicianInput): Promise<TechnicianRecord> {
  requireAuthenticated();
  assertTechnicianIsValid(input);
  return techniciansRepository.create(input);
}

export async function updateTechnician(
  id: string,
  input: TechnicianInput & { active: boolean },
): Promise<TechnicianRecord> {
  requireAuthenticated();
  assertTechnicianIsValid(input);
  if (!(await techniciansRepository.findById(id))) throw new NotFoundError("Technician", id);
  return techniciansRepository.update(id, input);
}

export async function deleteTechnician(id: string): Promise<void> {
  requireAuthenticated();
  if (!(await techniciansRepository.findById(id))) throw new NotFoundError("Technician", id);
  await techniciansRepository.delete(id);
}
