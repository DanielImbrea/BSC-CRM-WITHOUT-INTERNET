import { useQuery } from "@tanstack/react-query";
import { techniciansApi } from "../api/technicians-api";

export const techniciansQueryKeys = {
  all: ["technicians"] as const,
  list: () => [...techniciansQueryKeys.all, "list"] as const,
};

export function useTechnicians() {
  return useQuery({
    queryKey: techniciansQueryKeys.list(),
    queryFn: techniciansApi.list,
  });
}
