import { useAuth } from "../hooks/use-auth";
import { SetupPasswordScreen } from "./setup-password-screen";
import { LoginScreen } from "./login-screen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { phase, errorMessage } = useAuth();

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Se încarcă...</p>
      </div>
    );
  }

  if (phase === "needs-setup") {
    return <SetupPasswordScreen />;
  }

  if (phase === "needs-login") {
    return <LoginScreen />;
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center gap-2 text-center">
          <p className="text-sm text-destructive">
            Nu am putut porni aplicația: {errorMessage ?? "eroare necunoscută"}
          </p>
          <p className="text-xs text-muted-foreground">
            Verifică fereastra DevTools (Cmd+Option+I) pentru detalii tehnice, sau repornește aplicația.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
