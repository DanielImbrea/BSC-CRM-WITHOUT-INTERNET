import { z } from "zod";

export const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Parola trebuie să aibă cel puțin 8 caractere.")
      .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră.")
      .regex(/[a-zA-Z]/, "Parola trebuie să conțină cel puțin o literă."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu coincid.",
    path: ["confirmPassword"],
  });

export type SetupPasswordFormValues = z.infer<typeof setupPasswordSchema>;

export const loginSchema = z.object({
  password: z.string().min(1, "Introdu parola."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
