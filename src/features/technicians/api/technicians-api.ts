import type {
  CreateTechnicianRequest,
  TechnicianDto,
  UpdateTechnicianRequest,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const techniciansApi = {
  async list(): Promise<TechnicianDto[]> {
    return unwrapIpc(await window.labManager.technicians.list());
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
