import { format, parse } from "date-fns";
import { ro } from "date-fns/locale";

/** „2026-08” → „august 2026” (fără zile, ca să evite confuzii pe foile pentru doctori). */
export function formatReportMonthLabel(month: string): string {
  const date = parse(month, "yyyy-MM", new Date());
  const label = format(date, "MMMM yyyy", { locale: ro });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
