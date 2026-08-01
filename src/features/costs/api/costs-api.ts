import type {
  CostEntryDto,
  ListCostsFilters,
  CreateCostRequest,
  UpdateCostRequest,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const costsApi = {
  async list(filters: ListCostsFilters): Promise<CostEntryDto[]> {
    return unwrapIpc(await window.labManager.costs.list(filters));
  },
  async listCategories(): Promise<string[]> {
    return unwrapIpc(await window.labManager.costs.listCategories());
  },
  async create(payload: CreateCostRequest): Promise<CostEntryDto> {
    return unwrapIpc(await window.labManager.costs.create(payload));
  },
  async update(payload: UpdateCostRequest): Promise<CostEntryDto> {
    return unwrapIpc(await window.labManager.costs.update(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.costs.delete({ id }));
  },
};
