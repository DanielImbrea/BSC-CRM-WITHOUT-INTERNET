import { z } from "zod";

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const salaryFormSchema = z
  .object({
    employeeId: z.string().min(1, "Selectează un angajat."),
    period: z.string().regex(PERIOD_REGEX, 'Formatul trebuie să fie "AAAA-LL" (ex: 2026-08).'),
    baseAmount: z
      .string()
      .min(1, "Introdu salariul de bază.")
      .refine((v) => Number(v) >= 0, "Salariul de bază nu poate fi negativ."),
    bonuses: z.string().refine((v) => v === "" || Number(v) >= 0, "Bonusurile nu pot fi negative."),
    deductions: z.string().refine((v) => v === "" || Number(v) >= 0, "Deducerile nu pot fi negative."),
    paidAt: z.string().optional(),
  })
  .refine(
    (data) => Number(data.deductions || 0) <= Number(data.baseAmount) + Number(data.bonuses || 0),
    { message: "Deducerile nu pot depăși salariul de bază plus bonusurile.", path: ["deductions"] },
  );

export type SalaryFormValues = z.infer<typeof salaryFormSchema>;
