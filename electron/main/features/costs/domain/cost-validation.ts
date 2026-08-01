import { ValidationError } from "../../../shared/errors";

export interface CostInput {
  description: string;
  amount: number; // în bani (subunități)
  category: string;
  date: Date;
  workId?: string | null;
}

export function assertCostIsValid(input: CostInput): void {
  if (input.description.trim().length === 0) {
    throw new ValidationError("Descrierea costului este obligatorie.");
  }
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new ValidationError("Suma trebuie să fie un număr întreg pozitiv (în bani).");
  }
  if (input.category.trim().length === 0) {
    throw new ValidationError("Categoria este obligatorie.");
  }
  if (Number.isNaN(input.date.getTime())) {
    throw new ValidationError("Data nu este validă.");
  }
}
