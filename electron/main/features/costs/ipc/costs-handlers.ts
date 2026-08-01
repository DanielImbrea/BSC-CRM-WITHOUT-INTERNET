import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  CostEntryDto,
  ListCostsFilters,
  CreateCostRequest,
  UpdateCostRequest,
  DeleteCostRequest,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as costUseCases from "../application/cost-use-cases";
import type { CostRecord } from "../infrastructure/costs-repository";

function toDto(record: CostRecord): CostEntryDto {
  return {
    id: record.id,
    description: record.description,
    amount: record.amount,
    category: record.category,
    date: record.date.toISOString(),
    workId: record.workId,
    workTitle: record.workTitle,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function registerCostsHandlers(): void {
  registerIpcHandler<ListCostsFilters, CostEntryDto[]>(IPC_CHANNELS.COSTS_LIST, async (payload) => {
    const costs = await costUseCases.listCosts({
      category: payload?.category,
      dateFrom: payload?.dateFrom ? new Date(payload.dateFrom) : undefined,
      dateTo: payload?.dateTo ? new Date(payload.dateTo) : undefined,
    });
    return costs.map(toDto);
  });

  registerIpcHandler<void, string[]>(IPC_CHANNELS.COSTS_LIST_CATEGORIES, async () => {
    return costUseCases.listCostCategories();
  });

  registerIpcHandler<CreateCostRequest, CostEntryDto>(IPC_CHANNELS.COSTS_CREATE, async (payload) => {
    const cost = await costUseCases.createCost({
      description: payload.description,
      amount: payload.amount,
      category: payload.category,
      date: new Date(payload.date),
      workId: payload.workId,
    });
    return toDto(cost);
  });

  registerIpcHandler<UpdateCostRequest, CostEntryDto>(IPC_CHANNELS.COSTS_UPDATE, async (payload) => {
    const cost = await costUseCases.updateCost(payload.id, {
      description: payload.description,
      amount: payload.amount,
      category: payload.category,
      date: new Date(payload.date),
      workId: payload.workId,
    });
    return toDto(cost);
  });

  registerIpcHandler<DeleteCostRequest, void>(IPC_CHANNELS.COSTS_DELETE, async (payload) => {
    await costUseCases.deleteCost(payload.id);
  });
}
