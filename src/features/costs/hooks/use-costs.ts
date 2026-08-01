import { useQuery } from "@tanstack/react-query";
import { costsApi } from "../api/costs-api";
import type { ListCostsFilters } from "@shared-types/ipc";

export const costsQueryKeys = {
  all: ["costs"] as const,
  list: (filters: ListCostsFilters) => [...costsQueryKeys.all, "list", filters] as const,
  categories: () => [...costsQueryKeys.all, "categories"] as const,
};

export function useCosts(filters: ListCostsFilters) {
  return useQuery({
    queryKey: costsQueryKeys.list(filters),
    queryFn: () => costsApi.list(filters),
  });
}

export function useCostCategories() {
  return useQuery({
    queryKey: costsQueryKeys.categories(),
    queryFn: costsApi.listCategories,
  });
}
