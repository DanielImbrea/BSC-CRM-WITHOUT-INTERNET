import { z } from "zod";

export const doctorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere.")
    .max(120, "Numele este prea lung."),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Adresa de email nu este validă.")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;
