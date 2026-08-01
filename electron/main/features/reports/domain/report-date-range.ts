import { ValidationError } from "../../../shared/errors";

export interface DateRange {
  dateFrom: Date;
  dateTo: Date;
}

export function assertDateRangeIsValid(range: DateRange): void {
  if (Number.isNaN(range.dateFrom.getTime()) || Number.isNaN(range.dateTo.getTime())) {
    throw new ValidationError("Interval de date invalid.");
  }
  if (range.dateFrom > range.dateTo) {
    throw new ValidationError('Data de început ("de la") trebuie să fie înainte de data de sfârșit ("până la").');
  }
}

/** "2026-08-15" -> "2026-08" — folosit pentru a alinia perioadele lunare de salarii cu un interval de date. */
export function toPeriodString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
