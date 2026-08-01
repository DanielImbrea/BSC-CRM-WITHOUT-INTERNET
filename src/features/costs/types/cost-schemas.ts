import { z } from "zod";

export const costFormSchema = z.object({
  description: z.string().trim().min(1, "Descrierea este obligatorie."),
  amount: z
    .string()
    .min(1, "Introdu suma.")
    .refine((v) => Number(v) > 0, "Suma trebuie să fie mai mare ca 0."),
  category: z.string().trim().min(1, "Categoria este obligatorie."),
  date: z.string().min(1, "Data este obligatorie."),
  workId: z.string().optional(),
});

export type CostFormValues = z.infer<typeof costFormSchema>;
