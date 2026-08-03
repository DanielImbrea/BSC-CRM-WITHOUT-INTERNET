import { z } from "zod";

export const technicianFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere.")
    .max(120, "Numele este prea lung."),
  active: z.boolean(),
});

export type TechnicianFormValues = z.infer<typeof technicianFormSchema>;
