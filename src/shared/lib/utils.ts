import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formatează o sumă stocată în bani (subunități) ca RON, ex: 125000 -> "1.250,00 RON" */
export function formatMoney(amountInSubunits: number): string {
  const amount = amountInSubunits / 100;
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium" }).format(new Date(isoDate));
}
