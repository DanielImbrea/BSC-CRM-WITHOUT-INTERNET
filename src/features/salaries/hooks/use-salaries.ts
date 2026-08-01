import { useQuery } from "@tanstack/react-query";
import { salariesApi } from "../api/salaries-api";
import type { ListSalariesFilters } from "@shared-types/ipc";

export const salariesQueryKeys = {
  all: ["salaries"] as const,
  list: (filters: ListSalariesFilters) => [...salariesQueryKeys.all, "list", filters] as const,
};

export function useSalaries(filters: ListSalariesFilters) {
  return useQuery({
    queryKey: salariesQueryKeys.list(filters),
    queryFn: () => salariesApi.list(filters),
  });
}
