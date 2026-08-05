import { format, parse } from "date-fns";
import { ro } from "date-fns/locale";
import { PAYMENT_STATUS_LABELS } from "@/shared/lib/format";
import type { PaymentStatus } from "@shared-types/ipc";

/** „2026-08” → „august 2026”; gol → „Toate perioadele”. */
export function formatReportMonthLabel(month: string | undefined): string {
  if (!month) return "Toate perioadele";
  const date = parse(month, "yyyy-MM", new Date());
  const label = format(date, "MMMM yyyy", { locale: ro });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatReportStatusLabel(status: PaymentStatus | undefined): string {
  if (!status) return "Toate statusurile";
  return PAYMENT_STATUS_LABELS[status];
}

export function buildDoctorReportTitle(
  month: string | undefined,
  paymentStatus: PaymentStatus | undefined,
): string {
  return `Lucrări — ${formatReportStatusLabel(paymentStatus)} — ${formatReportMonthLabel(month)}`;
}
