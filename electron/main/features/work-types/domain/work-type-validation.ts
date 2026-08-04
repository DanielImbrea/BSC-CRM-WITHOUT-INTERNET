import { ValidationError } from "../../../shared/errors";

export interface WorkTypeInput {
  name: string;
}

export function assertWorkTypeIsValid(input: WorkTypeInput): void {
  if (input.name.trim().length < 2) {
    throw new ValidationError("Numele tipului de lucrare trebuie să aibă cel puțin 2 caractere.");
  }
}
