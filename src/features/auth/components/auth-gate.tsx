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

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
