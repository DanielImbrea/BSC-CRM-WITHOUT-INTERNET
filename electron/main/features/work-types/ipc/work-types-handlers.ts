import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  WorkTypeDto,
  ListWorkTypesRequest,
  ListWorkTypesResponse,
  CreateWorkTypeRequest,
  UpdateWorkTypeRequest,
  DeleteWorkTypeRequest,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as workTypeUseCases from "../application/work-type-use-cases";
import type { WorkTypeRecord } from "../infrastructure/work-types-repository";

function toDto(record: WorkTypeRecord): WorkTypeDto {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function registerWorkTypesHandlers(): void {
  registerIpcHandler<ListWorkTypesRequest | void, ListWorkTypesResponse>(
    IPC_CHANNELS.WORK_TYPES_LIST,
    async (payload) => {
      const result = await workTypeUseCases.listWorkTypes(payload ?? {});
      return {
        items: result.items.map(toDto),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };
    },
  );

  registerIpcHandler<CreateWorkTypeRequest, WorkTypeDto>(
    IPC_CHANNELS.WORK_TYPES_CREATE,
    async (payload) => toDto(await workTypeUseCases.createWorkType(payload)),
  );

  registerIpcHandler<UpdateWorkTypeRequest, WorkTypeDto>(
    IPC_CHANNELS.WORK_TYPES_UPDATE,
    async (payload) => toDto(await workTypeUseCases.updateWorkType(payload.id, payload)),
  );

  registerIpcHandler<DeleteWorkTypeRequest, void>(
    IPC_CHANNELS.WORK_TYPES_DELETE,
    async (payload) => {
      await workTypeUseCases.deleteWorkType(payload.id);
    },
  );
}
