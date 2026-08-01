import { ValidationError } from "../../../shared/errors";

export interface MaterialInput {
  name: string;
  unit: string;
  unitCost: number; // în bani (subunități)
  stockQuantity?: number;
  minStockQuantity?: number;
}

export function assertMaterialIsValid(input: MaterialInput): void {
  if (input.name.trim().length < 2) {
    throw new ValidationError("Numele materialului trebuie să aibă cel puțin 2 caractere.");
  }
  if (input.unit.trim().length === 0) {
    throw new ValidationError("Unitatea de măsură este obligatorie.");
  }
  if (!Number.isInteger(input.unitCost) || input.unitCost < 0) {
    throw new ValidationError("Costul unitar trebuie să fie un număr întreg pozitiv (în bani).");
  }
  if (input.stockQuantity !== undefined && input.stockQuantity < 0) {
    throw new ValidationError("Cantitatea în stoc nu poate fi negativă.");
  }
  if (input.minStockQuantity !== undefined && input.minStockQuantity < 0) {
    throw new ValidationError("Pragul minim de stoc nu poate fi negativ.");
  }
}

export function assertStockAdjustmentIsValid(currentStock: number, delta: number): void {
  if (delta === 0) {
    throw new ValidationError("Ajustarea de stoc trebuie să fie diferită de 0.");
  }
  if (currentStock + delta < 0) {
    throw new ValidationError("Ajustarea ar duce stocul sub 0.");
  }
}
