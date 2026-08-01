import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useAuth } from "../hooks/use-auth";
import { setupPasswordSchema, type SetupPasswordFormValues } from "../types/auth-schemas";

export function SetupPasswordScreen() {
  const { setupPassword, errorMessage } = useAuth();
  const form = useForm<SetupPasswordFormValues>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SetupPasswordFormValues) {
    try {
      await setupPassword(values.password);
    } catch {
      // Eroarea e deja expusă prin `errorMessage` din contextul de auth.
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Configurare inițială
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Setează parola de acces pentru această aplicație. Va fi cerută la fiecare pornire.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Parolă</Label>
              <Input id="password" type="password" autoFocus {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirmă parola</Label>
              <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
            <Button type="submit" disabled={form.formState.isSubmitting} className="mt-2">
              {form.formState.isSubmitting ? "Se configurează..." : "Continuă"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
