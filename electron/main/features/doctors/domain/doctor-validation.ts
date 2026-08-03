import { ValidationError } from "../../../shared/errors";

export interface DoctorInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export function assertDoctorIsValid(input: DoctorInput): void {
  if (input.name.trim().length < 2) {
    throw new ValidationError("Numele doctorului trebuie să aibă cel puțin 2 caractere.");
  }
}
