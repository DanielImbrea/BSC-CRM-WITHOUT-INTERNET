import type { ListTechniciansRequest } from "@shared-types/ipc";
import { techniciansRepository, type TechnicianRecord } from "../infrastructure/technicians-repository";
import { assertTechnicianIsValid, type TechnicianInput } from "../domain/technician-validation";
import { NotFoundError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listTechnicians(params: ListTechniciansRequest = {}): Promise<{
  items: TechnicianRecord[];
  total: number;
  page: number;
  pageSize: number;
}> {
  requireAuthenticated();
  if (params.all) {
    const items = await techniciansRepository.findAll();
    return { items, total: items.length, page: 1, pageSize: items.length };
  }
  return techniciansRepository.findPage({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
    search: params.search,
  });
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
