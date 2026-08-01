import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export interface ReportDateRange {
  dateFrom: string;
  dateTo: string;
}

interface ReportDateRangePickerProps {
  range: ReportDateRange;
  onChange: (range: ReportDateRange) => void;
}

export function ReportDateRangePicker({ range, onChange }: ReportDateRangePickerProps) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>De la data</Label>
        <Input
          type="date"
          className="w-40"
          value={range.dateFrom.slice(0, 10)}
          onChange={(e) => onChange({ ...range, dateFrom: new Date(e.target.value).toISOString() })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Până la data</Label>
        <Input
          type="date"
          className="w-40"
          value={range.dateTo.slice(0, 10)}
          onChange={(e) => onChange({ ...range, dateTo: new Date(e.target.value).toISOString() })}
        />
      </div>
    </div>
  );
}

function firstDayOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export function defaultReportRange(): ReportDateRange {
  return { dateFrom: firstDayOfMonth(), dateTo: new Date().toISOString() };
}
