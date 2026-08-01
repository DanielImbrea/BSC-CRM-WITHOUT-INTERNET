import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  WorkListItem,
  WorkDto,
  CreateWorkRequest,
  UpdateWorkStatusRequest,
  DeleteWorkRequest,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as workUseCases from "../application/work-use-cases";
import { computeTotalCost, type WorkListRecord, type WorkDetailRecord } from "../infrastructure/works-repository";

function toListItem(record: WorkListRecord): WorkListItem {
  return {
    id: record.id,
    title: record.title,
    clientName: record.clientName,
    status: record.status,
    startedAt: record.startedAt.toISOString(),
    totalCost: record.totalCost,
  };
}

function toDto(record: WorkDetailRecord): WorkDto {
  return {
    id: record.id,
    title: record.title,
    status: record.status,
    clientId: record.clientId,
    clientName: record.clientName,
    startedAt: record.startedAt.toISOString(),
    finishedAt: record.finishedAt ? record.finishedAt.toISOString() : null,
    materials: record.materials,
    costs: record.costs,
    totalCost: computeTotalCost(record.costs, record.materials),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function registerWorksHandlers(): void {
  registerIpcHandler<void, WorkListItem[]>(IPC_CHANNELS.WORKS_LIST, async () => {
    const works = await workUseCases.listWorks();
    return works.map(toListItem);
  });

  registerIpcHandler<{ id: string }, WorkDto>(IPC_CHANNELS.WORKS_GET, async (payload) => {
    const work = await workUseCases.getWork(payload.id);
    return toDto(work);
  });

  registerIpcHandler<CreateWorkRequest, WorkDto>(IPC_CHANNELS.WORKS_CREATE, async (payload) => {
    const work = await workUseCases.createWork(payload);
    return toDto(work);
  });

  registerIpcHandler<UpdateWorkStatusRequest, WorkDto>(
    IPC_CHANNELS.WORKS_UPDATE_STATUS,
    async (payload) => {
      const work = await workUseCases.updateWorkStatus(payload.id, payload.status);
      return toDto(work);
    },
  );

  registerIpcHandler<DeleteWorkRequest, void>(IPC_CHANNELS.WORKS_DELETE, async (payload) => {
    await workUseCases.deleteWork(payload.id);
  });
}
