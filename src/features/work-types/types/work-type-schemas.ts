import { z } from "zod";

export const workTypeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere.")
    .max(120, "Numele este prea lung."),
  doctorPrice: z.string().trim().min(1, "Prețul doctorului este obligatoriu."),
  technicianPrice: z.string().trim().min(1, "Prețul tehnicianului este obligatoriu."),
});

export type WorkTypeFormValues = z.infer<typeof workTypeFormSchema>;
