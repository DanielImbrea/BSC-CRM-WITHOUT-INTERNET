import { IPC_CHANNELS } from "@shared-types/ipc";
import type { EmployeeDto, CreateEmployeeRequest, UpdateEmployeeRequest, DeleteEmployeeRequest } from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as employeeUseCases from "../application/employee-use-cases";
import type { EmployeeRecord } from "../infrastructure/employees-repository";

function toDto(record: EmployeeRecord): EmployeeDto {
  return {
    id: record.id,
    name: record.name,
    position: record.position,
    active: record.active,
  };
}

export function registerEmployeesHandlers(): void {
  registerIpcHandler<void, EmployeeDto[]>(IPC_CHANNELS.EMPLOYEES_LIST, async () => {
    const employees = await employeeUseCases.listEmployees();
    return employees.map(toDto);
  });

  registerIpcHandler<CreateEmployeeRequest, EmployeeDto>(
    IPC_CHANNELS.EMPLOYEES_CREATE,
    async (payload) => {
      const employee = await employeeUseCases.createEmployee(payload);
      return toDto(employee);
    },
  );

  registerIpcHandler<UpdateEmployeeRequest, EmployeeDto>(
    IPC_CHANNELS.EMPLOYEES_UPDATE,
    async (payload) => {
      const employee = await employeeUseCases.updateEmployee(payload.id, payload);
      return toDto(employee);
    },
  );

  registerIpcHandler<DeleteEmployeeRequest, void>(IPC_CHANNELS.EMPLOYEES_DELETE, async (payload) => {
    await employeeUseCases.deleteEmployee(payload.id);
  });
}
