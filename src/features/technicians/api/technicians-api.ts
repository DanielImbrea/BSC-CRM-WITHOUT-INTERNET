import type {
  CreateTechnicianRequest,
  ListTechniciansRequest,
  ListTechniciansResponse,
  TechnicianDto,
  UpdateTechnicianRequest,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const techniciansApi = {
  async list(params: ListTechniciansRequest = {}): Promise<ListTechniciansResponse> {
    return unwrapIpc(await window.labManager.technicians.list(params));
  },
  async create(payload: CreateTechnicianRequest): Promise<TechnicianDto> {
    return unwrapIpc(await window.labManager.technicians.create(payload));
  },
  async update(payload: UpdateTechnicianRequest): Promise<TechnicianDto> {
    return unwrapIpc(await window.labManager.technicians.update(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.technicians.delete({ id }));
  },
};
