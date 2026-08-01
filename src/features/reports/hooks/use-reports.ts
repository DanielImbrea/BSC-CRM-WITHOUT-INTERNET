import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reports-api";
import type { ReportDateRangeRequest } from "@shared-types/ipc";

export function useFinancialSummaryReport(range: ReportDateRangeRequest) {
  return useQuery({
    queryKey: ["reports", "financial-summary", range],
    queryFn: () => reportsApi.getFinancialSummary(range),
  });
}

export function useClientReport(range: ReportDateRangeRequest) {
  return useQuery({
    queryKey: ["reports", "client-report", range],
    queryFn: () => reportsApi.getClientReport(range),
  });
}

export function useEmployeeReport(range: ReportDateRangeRequest) {
  return useQuery({
    queryKey: ["reports", "employee-report", range],
    queryFn: () => reportsApi.getEmployeeReport(range),
  });
}
