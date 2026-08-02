import { ValidationError } from "../../../shared/errors";

export interface WorkMaterialLine {
  materialName: string;
  quantity: number;
}

export interface WorkCostLine {
  description: string;
  amount: number;
  category: string;
}

export interface WorkInput {
  title: string;
  clientId: string;
  materials: WorkMaterialLine[];
  costs: WorkCostLine[];
}

export function assertWorkIsValid(input: WorkInput): void {
  if (input.title.trim().length < 2) {
    throw new ValidationError("Titlul lucrării trebuie să aibă cel puțin 2 caractere.");
  }
  if (!input.clientId) {
    throw new ValidationError("Trebuie selectat un client.");
  }

  for (const line of input.materials) {
    if (line.materialName.trim().length < 2) {
      throw new ValidationError("Numele materialului trebuie să aibă cel puțin 2 caractere.");
    }
    if (line.quantity <= 0) {
      throw new ValidationError("Cantitatea de material trebuie să fie mai mare ca 0.");
    }
  }

  const materialNames = input.materials.map((m) => m.materialName.trim().toLowerCase());
  if (new Set(materialNames).size !== materialNames.length) {
    throw new ValidationError("Același material apare de mai multe ori — combină-le într-o singură linie.");
  }

  for (const line of input.costs) {
    if (line.description.trim().length === 0) {
      throw new ValidationError("Fiecare cost trebuie să aibă o descriere.");
    }
    if (!Number.isInteger(line.amount) || line.amount <= 0) {
      throw new ValidationError("Suma unui cost trebuie să fie un număr întreg pozitiv (în bani).");
    }
    if (line.category.trim().length === 0) {
      throw new ValidationError("Fiecare cost trebuie să aibă o categorie.");
    }
  }
}
