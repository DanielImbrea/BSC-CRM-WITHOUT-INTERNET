import type {
  ReportDateRangeRequest,
  FinancialSummaryReportDto,
  ClientReportRowDto,
  EmployeeReportRowDto,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const reportsApi = {
  async getFinancialSummary(range: ReportDateRangeRequest): Promise<FinancialSummaryReportDto> {
    return unwrapIpc(await window.labManager.reports.getFinancialSummary(range));
  },
  async getClientReport(range: ReportDateRangeRequest): Promise<ClientReportRowDto[]> {
    return unwrapIpc(await window.labManager.reports.getClientReport(range));
  },
  async getEmployeeReport(range: ReportDateRangeRequest): Promise<EmployeeReportRowDto[]> {
    return unwrapIpc(await window.labManager.reports.getEmployeeReport(range));
  },
};
