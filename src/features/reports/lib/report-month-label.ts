import { endOfMonth, parse, startOfMonth } from "date-fns";

/** Transformă „2026-08” în „01.08.2026 – 31.08.2026”. */
export function formatReportMonthLabel(month: string): string {
  const start = startOfMonth(parse(month, "yyyy-MM", new Date()));
  const end = endOfMonth(start);
  const from = start.toLocaleDateString("ro-RO");
  const to = end.toLocaleDateString("ro-RO");
  return `${from} – ${to}`;
}
