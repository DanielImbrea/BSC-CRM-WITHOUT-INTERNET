import type {
  DoctorUnpaidReport,
  MonthReportRequest,
  MonthSummaryRequest,
  MonthSummaryReport,
  TechnicianSalaryReport,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const reportsApi = {
  async getDoctorUnpaid(payload: MonthReportRequest): Promise<DoctorUnpaidReport> {
    return unwrapIpc(await window.labManager.reports.getDoctorUnpaid(payload));
  },
  async getTechnicianSalary(payload: MonthReportRequest): Promise<TechnicianSalaryReport> {
    return unwrapIpc(await window.labManager.reports.getTechnicianSalary(payload));
  },
  async getMonthSummary(payload: MonthSummaryRequest): Promise<MonthSummaryReport> {
    return unwrapIpc(await window.labManager.reports.getMonthSummary(payload));
  },
};
