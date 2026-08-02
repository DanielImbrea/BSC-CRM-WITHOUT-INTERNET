import * as React from "react";
import { authApi } from "../api/auth-api";

type AuthPhase = "loading" | "needs-setup" | "needs-login" | "authenticated" | "error";

interface AuthContextValue {
  phase: AuthPhase;
  errorMessage: string | null;
  setupPassword: (password: string) => Promise<void>;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = React.useState<AuthPhase>("loading");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    authApi
      .getStatus()
      .then((status) => {
        if (cancelled) return;
        setPhase(status.configured ? "needs-login" : "needs-setup");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setPhase("error");
        setErrorMessage(error instanceof Error ? error.message : "Eroare necunoscută.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setupPassword = React.useCallback(async (password: string) => {
    setErrorMessage(null);
    try {
      await authApi.setupPassword(password);
      setPhase("authenticated");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Eroare necunoscută.");
      throw error;
    }
  }, []);

  const login = React.useCallback(async (password: string) => {
    setErrorMessage(null);
    try {
      await authApi.login({ password });
      setPhase("authenticated");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Eroare necunoscută.");
      throw error;
    }
  }, []);

  const logout = React.useCallback(async () => {
    await authApi.logout();
    setPhase("needs-login");
  }, []);

  const value = React.useMemo(
    () => ({ phase, errorMessage, setupPassword, login, logout }),
    [phase, errorMessage, setupPassword, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth trebuie folosit în interiorul unui AuthProvider.");
  }
  return ctx;
}
