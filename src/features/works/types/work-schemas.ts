import { z } from "zod";

export const workMaterialLineSchema = z.object({
  materialId: z.string().min(1, "Selectează un material."),
  // Cantitatea se introduce ca text în formular (input controlat de utilizator)
  // și se convertește în număr la submit — vezi transformarea din workFormSchema.
  quantity: z
    .string()
    .min(1, "Introdu cantitatea.")
    .refine((v) => Number(v) > 0, "Cantitatea trebuie să fie mai mare ca 0."),
});

export const workCostLineSchema = z.object({
  description: z.string().trim().min(1, "Introdu o descriere."),
  amount: z
    .string()
    .min(1, "Introdu suma.")
    .refine((v) => Number(v) > 0, "Suma trebuie să fie mai mare ca 0."),
  category: z.string().trim().min(1, "Introdu o categorie."),
});

export const workFormSchema = z.object({
  title: z.string().trim().min(2, "Titlul trebuie să aibă cel puțin 2 caractere."),
  clientId: z.string().min(1, "Selectează un client."),
  materials: z.array(workMaterialLineSchema),
  costs: z.array(workCostLineSchema),
});

export type WorkFormValues = z.infer<typeof workFormSchema>;
