export function formatRon(amountInBani: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 2,
  }).format(amountInBani / 100);
}

export function parseRonInput(value: string): number {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export const PAYMENT_STATUS_LABELS = {
  NEPLATITA: "Neplatită",
  PLATITA_DOCTOR: "Plătită doctor",
  PLATITA_TEHNICIAN: "Plătită tehnician",
} as const;

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO");
}
