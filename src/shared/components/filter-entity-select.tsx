import { Label } from "@/shared/components/ui/label";
import {
  SearchableEntitySelect,
  type EntityOption,
  type SearchableEntitySelectProps,
} from "@/shared/components/searchable-entity-select";

export type FilterEntityOption = EntityOption;

interface FilterEntitySelectProps extends Omit<
  SearchableEntitySelectProps,
  "clearLabel" | "emptyLabel"
> {
  label: string;
  placeholder?: string;
  allLabel?: string;
}

export function FilterEntitySelect({
  label,
  placeholder = "Oricare",
  allLabel = "Oricare",
  ...props
}: FilterEntitySelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <SearchableEntitySelect
        {...props}
        emptyLabel={allLabel}
        clearLabel={allLabel}
      />
    </div>
  );
}
