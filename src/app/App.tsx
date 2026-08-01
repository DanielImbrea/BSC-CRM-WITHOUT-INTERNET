import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./providers";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { router } from "@/routes/router";

export function App() {
  return (
    <AppProviders>
      <AuthGate>
        <RouterProvider router={router} />
      </AuthGate>
    </AppProviders>
  );
}
