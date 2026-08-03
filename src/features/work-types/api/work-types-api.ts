import type {
  CreateWorkTypeRequest,
  UpdateWorkTypeRequest,
  WorkTypeDto,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const workTypesApi = {
  async list(): Promise<WorkTypeDto[]> {
    return unwrapIpc(await window.labManager.workTypes.list());
  },
  async create(payload: CreateWorkTypeRequest): Promise<WorkTypeDto> {
    return unwrapIpc(await window.labManager.workTypes.create(payload));
  },
  async update(payload: UpdateWorkTypeRequest): Promise<WorkTypeDto> {
    return unwrapIpc(await window.labManager.workTypes.update(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.workTypes.delete({ id }));
  },
};
