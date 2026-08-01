import type { WorkDto, WorkListItem, CreateWorkRequest, WorkStatus } from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const worksApi = {
  async list(): Promise<WorkListItem[]> {
    return unwrapIpc(await window.labManager.works.list());
  },
  async get(id: string): Promise<WorkDto> {
    return unwrapIpc(await window.labManager.works.get({ id }));
  },
  async create(payload: CreateWorkRequest): Promise<WorkDto> {
    return unwrapIpc(await window.labManager.works.create(payload));
  },
  async updateStatus(id: string, status: WorkStatus): Promise<WorkDto> {
    return unwrapIpc(await window.labManager.works.updateStatus({ id, status }));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.works.delete({ id }));
  },
};
