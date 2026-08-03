import { ValidationError } from "../../../shared/errors";

export interface WorkTypeInput {
  name: string;
  doctorPrice: number;
  technicianPrice: number;
}

export function assertWorkTypeIsValid(input: WorkTypeInput): void {
  if (input.name.trim().length < 2) {
    throw new ValidationError("Numele tipului de lucrare trebuie să aibă cel puțin 2 caractere.");
  }
  if (!Number.isInteger(input.doctorPrice) || input.doctorPrice < 0) {
    throw new ValidationError("Prețul doctor trebuie să fie un număr întreg pozitiv (în bani).");
  }
  if (!Number.isInteger(input.technicianPrice) || input.technicianPrice < 0) {
    throw new ValidationError("Prețul tehnician trebuie să fie un număr întreg pozitiv (în bani).");
  }
}
