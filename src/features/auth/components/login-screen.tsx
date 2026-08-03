import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useAuth } from "../hooks/use-auth";
import { loginSchema, type LoginFormValues } from "../types/auth-schemas";

export function LoginScreen() {
  const { login, resetPassword, errorMessage } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.password);
    } catch {
      form.resetField("password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Billionaire Smile Club CRM</CardTitle>
          <p className="text-sm text-muted-foreground">Introdu parola pentru a continua.</p>
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
            {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
            <Button type="submit" disabled={form.formState.isSubmitting} className="mt-2">
              {form.formState.isSubmitting ? "Se verifică..." : "Autentificare"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-muted-foreground"
              disabled={form.formState.isSubmitting}
              onClick={() => {
                if (
                  window.confirm(
                    "Resetezi parola aplicației? Vei putea seta una nouă imediat. Datele (doctori, lucrări) rămân.",
                  )
                ) {
                  void resetPassword();
                }
              }}
            >
              Resetează parola
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
