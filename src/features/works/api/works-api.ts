import type {
  CreateWorkRequest,
  ListWorksRequest,
  ListWorksResponse,
  SearchWorksFilters,
  SearchWorksResponse,
  UpdateWorkPaymentStatusRequest,
  UpdateWorkRequest,
  WorkDto,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const worksApi = {
  async list(params: ListWorksRequest = {}): Promise<ListWorksResponse> {
    return unwrapIpc(await window.labManager.works.list(params));
  },
  async search(filters: SearchWorksFilters): Promise<SearchWorksResponse> {
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
