import type {
  CreateWorkRequest,
  SearchWorksFilters,
  UpdateWorkPaymentStatusRequest,
  UpdateWorkRequest,
  WorkDto,
  WorkListItem,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const worksApi = {
  async list(): Promise<WorkListItem[]> {
    return unwrapIpc(await window.labManager.works.list());
  },
  async search(filters: SearchWorksFilters): Promise<WorkListItem[]> {
    return unwrapIpc(await window.labManager.works.search(filters));
  },
  async get(id: string): Promise<WorkDto> {
    return unwrapIpc(await window.labManager.works.get({ id }));
  },
  async create(payload: CreateWorkRequest): Promise<WorkDto> {
    return unwrapIpc(await window.labManager.works.create(payload));
  },
  async update(payload: UpdateWorkRequest): Promise<WorkDto> {
    return unwrapIpc(await window.labManager.works.update(payload));
  },
  async updatePaymentStatus(payload: UpdateWorkPaymentStatusRequest): Promise<WorkDto> {
    return unwrapIpc(await window.labManager.works.updatePaymentStatus(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.works.delete({ id }));
  },
};
