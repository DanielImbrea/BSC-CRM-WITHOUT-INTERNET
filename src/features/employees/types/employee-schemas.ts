import { z } from "zod";

export const employeeFormSchema = z.object({
  name: z.string().trim().min(2, "Numele trebuie să aibă cel puțin 2 caractere."),
  position: z.string().trim().optional(),
  active: z.boolean(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
