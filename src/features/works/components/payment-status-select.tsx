import type { PaymentStatus } from "@shared-types/ipc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PAYMENT_STATUS_LABELS } from "@/shared/lib/format";

const PAYMENT_STATUSES: PaymentStatus[] = ["NEPLATITA", "PLATITA_DOCTOR", "PLATITA_TEHNICIAN"];

interface PaymentStatusSelectProps {
  value: PaymentStatus | "";
  onChange: (value: PaymentStatus | "") => void;
  allowAll?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export function PaymentStatusSelect({
  value,
  onChange,
  allowAll = false,
  placeholder = "Selectează status",
  compact = false,
}: PaymentStatusSelectProps) {
  return (
    <Select
      value={value || (allowAll ? "__all__" : undefined)}
      onValueChange={(v) => onChange(v === "__all__" ? "" : (v as PaymentStatus))}
    >
      <SelectTrigger className={compact ? "h-8 min-w-[9rem] text-xs" : undefined}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value="__all__">Toate</SelectItem>}
        {PAYMENT_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {PAYMENT_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function paymentStatusBadgeVariant(
  status: PaymentStatus,
): "destructive" | "warning" | "success" | "default" {
  switch (status) {
    case "NEPLATITA":
      return "destructive";
    case "PLATITA_DOCTOR":
      return "warning";
    case "PLATITA_TEHNICIAN":
      return "success";
    default:
      return "default";
  }
}
