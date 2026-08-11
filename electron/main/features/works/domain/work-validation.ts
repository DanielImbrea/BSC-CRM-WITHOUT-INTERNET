import type { PaymentStatus, SearchWorksFilters } from "@shared-types/ipc";
import { ValidationError } from "../../../shared/errors";

export interface WorkLineInput {
  workTypeId: string;
  technicianId?: string;
  technician2Id?: string;
  technician3Id?: string;
  quantity: number;
  doctorUnitPrice: number;
  technicianUnitPrice: number;
  technician2UnitPrice?: number;
  technician3UnitPrice?: number;
}

export interface WorkInput {
  entryDate: Date;
  patientName: string;
  observations?: string;
  paymentStatus: PaymentStatus;
  doctorId: string;
  technician1Id?: string;
  technician2Id?: string;
  technician3Id?: string;
  lines: WorkLineInput[];
}

const PAYMENT_STATUSES: PaymentStatus[] = ["NEPLATITA", "PLATITA_DOCTOR", "PLATITA_TEHNICIAN"];

export function assertPaymentStatus(status: string): asserts status is PaymentStatus {
  if (!PAYMENT_STATUSES.includes(status as PaymentStatus)) {
    throw new ValidationError("Status de plată invalid.");
  }
}

export function assertWorkIsValid(input: WorkInput): void {
  if (input.patientName.trim().length < 2) {
    throw new ValidationError("Numele pacientului trebuie să aibă cel puțin 2 caractere.");
  }
  if (!input.doctorId) {
    throw new ValidationError("Trebuie selectat un doctor.");
  }
  assertPaymentStatus(input.paymentStatus);
  if (input.lines.length === 0) {
    throw new ValidationError("Adaugă cel puțin o linie de lucrare.");
  }
  for (const line of input.lines) {
    if (line.quantity <= 0) {
      throw new ValidationError("Cantitatea trebuie să fie mai mare ca 0.");
    }
    if (!Number.isInteger(line.doctorUnitPrice) || line.doctorUnitPrice < 0) {
      throw new ValidationError("Prețul doctor pe linie trebuie să fie valid.");
    }
    if (!Number.isInteger(line.technicianUnitPrice) || line.technicianUnitPrice < 0) {
      throw new ValidationError("Prețul tehnician pe linie trebuie să fie valid.");
    }
    if (line.technician2UnitPrice != null && (!Number.isInteger(line.technician2UnitPrice) || line.technician2UnitPrice < 0)) {
      throw new ValidationError("Prețul tehnician 2 pe linie trebuie să fie valid.");
    }
    if (line.technician3UnitPrice != null && (!Number.isInteger(line.technician3UnitPrice) || line.technician3UnitPrice < 0)) {
      throw new ValidationError("Prețul tehnician 3 pe linie trebuie să fie valid.");
    }
  }
}

export function parseMonthRange(month: string): { from: Date; to: Date } {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) {
    throw new ValidationError("Luna trebuie să fie în format YYYY-MM.");
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const from = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const to = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

export function buildSearchDateRange(filters: SearchWorksFilters): { from?: Date; to?: Date } {
  if (!filters.month) return {};
  const { from, to } = parseMonthRange(filters.month);
  return { from, to };
}
