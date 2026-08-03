import { ValidationError } from "../../../shared/errors";

export interface TechnicianInput {
  name: string;
  active?: boolean;
}

export function assertTechnicianIsValid(input: TechnicianInput): void {
  if (input.name.trim().length < 2) {
    throw new ValidationError("Numele tehnicianului trebuie să aibă cel puțin 2 caractere.");
  }
}
