import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Introdu parola curentă."),
    newPassword: z
      .string()
      .min(8, "Parola nouă trebuie să aibă cel puțin 8 caractere.")
      .regex(/[0-9]/, "Parola nouă trebuie să conțină cel puțin o cifră.")
      .regex(/[a-zA-Z]/, "Parola nouă trebuie să conțină cel puțin o literă."),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Parolele nu coincid.",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
