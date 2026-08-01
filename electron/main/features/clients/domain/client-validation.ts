import { ValidationError } from "../../../shared/errors";

export interface ClientInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reguli de business pentru un Client, independente de Prisma/Electron —
 * testabile izolat și reutilizabile din orice strat (create sau update).
 */
export function assertClientIsValid(input: ClientInput): void {
  const trimmedName = input.name.trim();
  if (trimmedName.length < 2) {
    throw new ValidationError("Numele clientului trebuie să aibă cel puțin 2 caractere.");
  }
  if (trimmedName.length > 120) {
    throw new ValidationError("Numele clientului este prea lung (maxim 120 caractere).");
  }
  if (input.email && !EMAIL_REGEX.test(input.email)) {
    throw new ValidationError("Adresa de email nu este validă.");
  }
  if (input.phone && input.phone.replace(/\D/g, "").length < 6) {
    throw new ValidationError("Numărul de telefon nu este valid.");
  }
}
