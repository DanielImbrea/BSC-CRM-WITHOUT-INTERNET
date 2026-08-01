import { z } from "zod";

export const materialFormSchema = z.object({
  name: z.string().trim().min(2, "Numele trebuie să aibă cel puțin 2 caractere."),
  unit: z.string().trim().min(1, "Unitatea de măsură este obligatorie."),
  // Prețul se introduce în RON de utilizator, se convertește în bani la submit.
  unitCost: z
    .string()
    .min(1, "Introdu prețul unitar.")
    .refine((v) => Number(v) >= 0, "Prețul unitar nu poate fi negativ."),
  minStockQuantity: z
    .string()
    .optional()
    .refine((v) => !v || Number(v) >= 0, "Pragul minim de stoc nu poate fi negativ."),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;

export const stockAdjustmentSchema = z.object({
  delta: z
    .string()
    .min(1, "Introdu o cantitate.")
    .refine((v) => Number(v) !== 0, "Cantitatea trebuie să fie diferită de 0."),
});

export type StockAdjustmentValues = z.infer<typeof stockAdjustmentSchema>;
