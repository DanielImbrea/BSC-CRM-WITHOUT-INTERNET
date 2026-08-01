import { ValidationError } from "../../../shared/errors";

export interface SalaryInput {
  employeeId: string;
  period: string; // "YYYY-MM"
  baseAmount: number; // în bani
  bonuses: number;
  deductions: number;
  paidAt?: Date | null;
}

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function assertSalaryIsValid(input: SalaryInput): void {
  if (!input.employeeId) {
    throw new ValidationError("Trebuie selectat un angajat.");
  }
  if (!PERIOD_REGEX.test(input.period)) {
    throw new ValidationError('Perioada trebuie să fie în formatul "AAAA-LL" (ex: 2026-08).');
  }
  if (!Number.isInteger(input.baseAmount) || input.baseAmount < 0) {
    throw new ValidationError("Salariul de bază trebuie să fie un număr întreg pozitiv (în bani).");
  }
  if (!Number.isInteger(input.bonuses) || input.bonuses < 0) {
    throw new ValidationError("Bonusurile trebuie să fie un număr întreg pozitiv (în bani).");
  }
  if (!Number.isInteger(input.deductions) || input.deductions < 0) {
    throw new ValidationError("Deducerile trebuie să fie un număr întreg pozitiv (în bani).");
  }
  if (input.deductions > input.baseAmount + input.bonuses) {
    throw new ValidationError("Deducerile nu pot depăși salariul de bază plus bonusurile.");
  }
}

/**
 * Suma netă NU se preia niciodată de la client — se calculează mereu
 * pe server, ca să nu poată fi falsificată/desincronizată din formular.
 */
export function computeNetAmount(input: SalaryInput): number {
  return input.baseAmount + input.bonuses - input.deductions;
}
