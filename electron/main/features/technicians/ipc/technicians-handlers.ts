import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  TechnicianDto,
  ListTechniciansRequest,
  ListTechniciansResponse,
  CreateTechnicianRequest,
  UpdateTechnicianRequest,
  DeleteTechnicianRequest,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as technicianUseCases from "../application/technician-use-cases";
import type { TechnicianRecord } from "../infrastructure/technicians-repository";

function toDto(record: TechnicianRecord): TechnicianDto {
  return {
    id: record.id,
    name: record.name,
    active: record.active,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function registerTechniciansHandlers(): void {
  registerIpcHandler<ListTechniciansRequest | void, ListTechniciansResponse>(
    IPC_CHANNELS.TECHNICIANS_LIST,
    async (payload) => {
      const result = await technicianUseCases.listTechnicians(payload ?? {});
      return {
        items: result.items.map(toDto),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };
    },
  );

  registerIpcHandler<CreateTechnicianRequest, TechnicianDto>(
    IPC_CHANNELS.TECHNICIANS_CREATE,
    async (payload) => toDto(await technicianUseCases.createTechnician(payload)),
  );

  registerIpcHandler<UpdateTechnicianRequest, TechnicianDto>(
    IPC_CHANNELS.TECHNICIANS_UPDATE,
    async (payload) =>
      toDto(await technicianUseCases.updateTechnician(payload.id, payload)),
  );

  registerIpcHandler<DeleteTechnicianRequest, void>(
    IPC_CHANNELS.TECHNICIANS_DELETE,
    async (payload) => {
      await technicianUseCases.deleteTechnician(payload.id);
    },
  );
}
