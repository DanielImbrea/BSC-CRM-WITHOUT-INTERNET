import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  SalaryEntryDto,
  ListSalariesFilters,
  CreateSalaryRequest,
  UpdateSalaryRequest,
  DeleteSalaryRequest,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as salaryUseCases from "../application/salary-use-cases";
import type { SalaryRecord } from "../infrastructure/salaries-repository";

function toDto(record: SalaryRecord): SalaryEntryDto {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    period: record.period,
    baseAmount: record.baseAmount,
    bonuses: record.bonuses,
    deductions: record.deductions,
    netAmount: record.netAmount,
    paidAt: record.paidAt ? record.paidAt.toISOString() : null,
  };
}

export function registerSalariesHandlers(): void {
  registerIpcHandler<ListSalariesFilters, SalaryEntryDto[]>(IPC_CHANNELS.SALARIES_LIST, async (payload) => {
    const salaries = await salaryUseCases.listSalaries({
      employeeId: payload?.employeeId,
      period: payload?.period,
    });
    return salaries.map(toDto);
  });

  registerIpcHandler<CreateSalaryRequest, SalaryEntryDto>(IPC_CHANNELS.SALARIES_CREATE, async (payload) => {
    const salary = await salaryUseCases.createSalary({
      employeeId: payload.employeeId,
      period: payload.period,
      baseAmount: payload.baseAmount,
      bonuses: payload.bonuses,
      deductions: payload.deductions,
      paidAt: payload.paidAt ? new Date(payload.paidAt) : null,
    });
    return toDto(salary);
  });

  registerIpcHandler<UpdateSalaryRequest, SalaryEntryDto>(IPC_CHANNELS.SALARIES_UPDATE, async (payload) => {
    const salary = await salaryUseCases.updateSalary(payload.id, {
      employeeId: payload.employeeId,
      period: payload.period,
      baseAmount: payload.baseAmount,
      bonuses: payload.bonuses,
      deductions: payload.deductions,
      paidAt: payload.paidAt ? new Date(payload.paidAt) : null,
    });
    return toDto(salary);
  });

  registerIpcHandler<DeleteSalaryRequest, void>(IPC_CHANNELS.SALARIES_DELETE, async (payload) => {
    await salaryUseCases.deleteSalary(payload.id);
  });
}
