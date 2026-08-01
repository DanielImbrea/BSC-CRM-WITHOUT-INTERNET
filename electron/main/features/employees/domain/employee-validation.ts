import { ValidationError } from "../../../shared/errors";

export interface EmployeeInput {
  name: string;
  position?: string;
  active?: boolean;
}

export function assertEmployeeIsValid(input: EmployeeInput): void {
  if (input.name.trim().length < 2) {
    throw new ValidationError("Numele angajatului trebuie să aibă cel puțin 2 caractere.");
  }
}
