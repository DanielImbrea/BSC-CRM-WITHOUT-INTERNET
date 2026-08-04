import { z } from "zod";

export const workTypeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere.")
    .max(120, "Numele este prea lung."),
});

export type WorkTypeFormValues = z.infer<typeof workTypeFormSchema>;
