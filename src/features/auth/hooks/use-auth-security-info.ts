import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth-api";

export function useAuthSecurityInfo() {
  return useQuery({
    queryKey: ["auth", "security-info"],
    queryFn: authApi.getSecurityInfo,
  });
}
