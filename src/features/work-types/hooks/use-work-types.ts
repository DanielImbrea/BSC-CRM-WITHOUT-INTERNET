import { useQuery } from "@tanstack/react-query";
import { workTypesApi } from "../api/work-types-api";
import type { ListWorkTypesRequest } from "@shared-types/ipc";

export const workTypesQueryKeys = {
  all: ["work-types"] as const,
  list: (params: ListWorkTypesRequest) => [...workTypesQueryKeys.all, "list", params] as const,
  allCatalog: () => [...workTypesQueryKeys.all, "all"] as const,
};

/** Catalog complet — pentru dropdown-uri în formulare */
export function useWorkTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: workTypesQueryKeys.allCatalog(),
    queryFn: async () => {
      const result = await workTypesApi.list({ all: true });
      return result.items;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/** Listă paginată — pentru pagina Tipuri lucrări */
export function useWorkTypesList(params: ListWorkTypesRequest) {
  return useQuery({
    queryKey: workTypesQueryKeys.list(params),
    queryFn: () => workTypesApi.list(params),
  });
}
