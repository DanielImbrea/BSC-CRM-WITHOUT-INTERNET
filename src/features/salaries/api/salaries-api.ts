import type {
  SalaryEntryDto,
  ListSalariesFilters,
  CreateSalaryRequest,
  UpdateSalaryRequest,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const salariesApi = {
  async list(filters: ListSalariesFilters): Promise<SalaryEntryDto[]> {
    return unwrapIpc(await window.labManager.salaries.list(filters));
  },
  async create(payload: CreateSalaryRequest): Promise<SalaryEntryDto> {
    return unwrapIpc(await window.labManager.salaries.create(payload));
  },
  async update(payload: UpdateSalaryRequest): Promise<SalaryEntryDto> {
    return unwrapIpc(await window.labManager.salaries.update(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.salaries.delete({ id }));
  },
};
