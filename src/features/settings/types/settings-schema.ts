import { z } from "zod";

export const settingsFormSchema = z.object({
  autoBackupEnabled: z.boolean(),
  maxBackupsRetained: z
    .string()
    .min(1, "Introdu o valoare.")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 100;
    }, "Trebuie să fie un număr întreg între 1 și 100."),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
