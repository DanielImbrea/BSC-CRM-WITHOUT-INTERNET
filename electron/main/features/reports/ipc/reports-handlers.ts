import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  ReportDateRangeRequest,
  FinancialSummaryReportDto,
  ClientReportRowDto,
  EmployeeReportRowDto,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as reportUseCases from "../application/report-use-cases";

function toRange(payload: ReportDateRangeRequest) {
  return { dateFrom: new Date(payload.dateFrom), dateTo: new Date(payload.dateTo) };
}

export function registerReportsHandlers(): void {
  registerIpcHandler<ReportDateRangeRequest, FinancialSummaryReportDto>(
    IPC_CHANNELS.REPORTS_FINANCIAL_SUMMARY,
    async (payload) => reportUseCases.getFinancialSummaryReport(toRange(payload)),
  );

  registerIpcHandler<ReportDateRangeRequest, ClientReportRowDto[]>(
    IPC_CHANNELS.REPORTS_CLIENT_REPORT,
    async (payload) => reportUseCases.getClientReport(toRange(payload)),
  );

  registerIpcHandler<ReportDateRangeRequest, EmployeeReportRowDto[]>(
    IPC_CHANNELS.REPORTS_EMPLOYEE_REPORT,
    async (payload) => reportUseCases.getEmployeeReport(toRange(payload)),
  );
}
