import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Alege data", className }: DatePickerProps) {
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start gap-2 border-input bg-card px-3 text-left font-normal hover:bg-accent/40",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
          {value ? format(selected!, "dd MMM yyyy", { locale: ro }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          initialFocus
          locale={ro}
        />
      </PopoverContent>
    </Popover>
  );
}

interface MonthPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  allowAll?: boolean;
  placeholder?: string;
}

export function MonthPicker({
  value,
  onChange,
  className,
  allowAll = false,
  placeholder,
}: MonthPickerProps) {
  const selected = value ? parseISO(`${value}-01`) : undefined;
  const emptyLabel = placeholder ?? (allowAll ? "Toate perioadele" : "Selectează luna");

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 min-w-0 flex-1 justify-start gap-2 border-input bg-card px-3 text-left font-normal hover:bg-accent/40",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
            {value ? format(selected!, "MMMM yyyy", { locale: ro }) : emptyLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => onChange(date ? format(date, "yyyy-MM") : "")}
            captionLayout="dropdown-buttons"
            fromYear={2020}
            toYear={2035}
            locale={ro}
          />
        </PopoverContent>
      </Popover>
      {allowAll && value && (
        <Button type="button" variant="outline" className="h-9 shrink-0 px-3" onClick={() => onChange("")}>
          Toate
        </Button>
      )}
    </div>
  );
}
