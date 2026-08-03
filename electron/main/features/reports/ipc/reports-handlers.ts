import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  MonthReportRequest,
  DoctorUnpaidReport,
  TechnicianSalaryReport,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as reportUseCases from "../application/report-use-cases";

export function registerReportsHandlers(): void {
  registerIpcHandler<MonthReportRequest, DoctorUnpaidReport>(
    IPC_CHANNELS.REPORTS_DOCTOR_UNPAID,
    async (payload) => reportUseCases.getDoctorUnpaidReport(payload),
  );

  registerIpcHandler<MonthReportRequest, TechnicianSalaryReport>(
    IPC_CHANNELS.REPORTS_TECHNICIAN_SALARY,
    async (payload) => reportUseCases.getTechnicianSalaryReport(payload),
  );
}
