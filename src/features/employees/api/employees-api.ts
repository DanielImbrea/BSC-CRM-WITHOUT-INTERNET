import type { EmployeeDto, CreateEmployeeRequest, UpdateEmployeeRequest } from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const employeesApi = {
  async list(): Promise<EmployeeDto[]> {
    return unwrapIpc(await window.labManager.employees.list());
  },
  async create(payload: CreateEmployeeRequest): Promise<EmployeeDto> {
    return unwrapIpc(await window.labManager.employees.create(payload));
  },
  async update(payload: UpdateEmployeeRequest): Promise<EmployeeDto> {
    return unwrapIpc(await window.labManager.employees.update(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.employees.delete({ id }));
  },
};
