import { ValidationError } from "../../../shared/errors";

const MIN_LENGTH = 8;

/**
 * Regulile de validitate pentru parola aplicației.
 * Pură, fără dependențe — testabilă izolat, fără DB sau Electron.
 */
export function assertPasswordIsValid(password: string): void {
  if (password.length < MIN_LENGTH) {
    throw new ValidationError(`Parola trebuie să aibă cel puțin ${MIN_LENGTH} caractere.`);
  }
  if (!/[0-9]/.test(password)) {
    throw new ValidationError("Parola trebuie să conțină cel puțin o cifră.");
  }
  if (!/[a-zA-Z]/.test(password)) {
    throw new ValidationError("Parola trebuie să conțină cel puțin o literă.");
  }
}
