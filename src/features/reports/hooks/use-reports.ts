import { useMutation } from "@tanstack/react-query";
import { reportsApi } from "../api/reports-api";
import type { MonthReportRequest, MonthSummaryRequest } from "@shared-types/ipc";

export function useDoctorUnpaidReport() {
  return useMutation({
    mutationFn: (payload: MonthReportRequest) => reportsApi.getDoctorUnpaid(payload),
  });
}

export function useTechnicianSalaryReport() {
  return useMutation({
    mutationFn: (payload: MonthReportRequest) => reportsApi.getTechnicianSalary(payload),
  });
}

export function useMonthSummaryReport() {
  return useMutation({
    mutationFn: (payload: MonthSummaryRequest) => reportsApi.getMonthSummary(payload),
  });
}
