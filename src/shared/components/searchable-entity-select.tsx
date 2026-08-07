import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

const NONE = "__none__";
const MAX_VISIBLE = 100;

export interface EntityOption {
  id: string;
  label: string;
}

export interface SearchableEntitySelectProps {
  value: string;
  onChange: (value: string) => void;
  onSelectOption?: (option: EntityOption | null) => void;
  queryKey: string;
  loadOptions: () => Promise<EntityOption[]>;
  /** Afișat când există valoare dar catalogul nu e încă încărcat (ex. edit) */
  valueLabel?: string | null;
  emptyLabel?: string;
  /** Dacă e setat, permite golirea selecției */
  clearLabel?: string;
  searchPlaceholder?: string;
  filterOptions?: (options: EntityOption[]) => EntityOption[];
  disabled?: boolean;
  className?: string;
}

/** Asigură că valoarea selectată există în listă — Radix resetează selecția dacă lipsește. */
function withSelectedOption(
  options: EntityOption[],
  value: string,
  valueLabel: string | null | undefined,
): EntityOption[] {
  if (!value || options.some((option) => option.id === value)) {
    return options;
  }
  if (valueLabel) {
    return [{ id: value, label: valueLabel }, ...options];
  }
  return options;
}

export function SearchableEntitySelect({
  value,
  onChange,
  onSelectOption,
  queryKey,
  loadOptions,
  valueLabel,
  emptyLabel = "Selectează",
  clearLabel,
  searchPlaceholder = "Caută...",
  filterOptions,
  disabled,
  className,
}: SearchableEntitySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const allowClear = clearLabel !== undefined;

  const { data: options = [], isLoading } = useQuery({
    queryKey: ["searchable-entity-select", queryKey],
    queryFn: loadOptions,
    // Preîncarcă dacă există valoare (edit) — evită reset Radix când lipsește SelectItem.
    enabled: open || Boolean(value),
    staleTime: 5 * 60 * 1000,
  });

  const catalogOptions = React.useMemo(
    () => withSelectedOption(options, value, valueLabel),
    [options, value, valueLabel],
  );

  const visibleOptions = React.useMemo(() => {
    const base = filterOptions ? filterOptions(catalogOptions) : catalogOptions;
    const term = search.trim().toLowerCase();
    const filtered = term ? base.filter((o) => o.label.toLowerCase().includes(term)) : base;
    return filtered.slice(0, MAX_VISIBLE);
  }, [catalogOptions, filterOptions, search]);

  const selectedLabel = React.useMemo(() => {
    if (!value) return null;
    return catalogOptions.find((o) => o.id === value)?.label ?? valueLabel ?? null;
  }, [value, catalogOptions, valueLabel]);

  const displayLabel = value ? (selectedLabel ?? "Se încarcă...") : emptyLabel;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSearch("");
  }

  function handleValueChange(next: string) {
    if (allowClear && next === NONE) {
      onChange("");
      onSelectOption?.(null);
      return;
    }
    const option = catalogOptions.find((o) => o.id === next) ?? null;
    onChange(next);
    onSelectOption?.(option);
  }

  const selectValue = value || (allowClear ? NONE : undefined);

  return (
    <Select
      open={open}
      onOpenChange={handleOpenChange}
      value={selectValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn(className)}>
        <span className="truncate">{displayLabel}</span>
      </SelectTrigger>
      <SelectContent
        className="overflow-hidden p-0"
        viewportClassName="flex max-h-64 flex-col overflow-hidden p-0"
      >
        <div className="shrink-0 border-b border-border bg-card p-2">
          <Input
            value={search}
            placeholder={searchPlaceholder}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-1">
          {allowClear && <SelectItem value={NONE}>{clearLabel}</SelectItem>}
          {isLoading && options.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">Se încarcă...</p>
          )}
          {!isLoading && visibleOptions.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">Niciun rezultat.</p>
          )}
          {visibleOptions.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))}
          {!isLoading && options.length > MAX_VISIBLE && !search.trim() && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              Scrie pentru a filtra ({options.length.toLocaleString("ro-RO")} în total).
            </p>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
