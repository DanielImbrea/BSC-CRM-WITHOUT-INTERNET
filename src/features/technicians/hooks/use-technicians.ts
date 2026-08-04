import { useQuery } from "@tanstack/react-query";
import { techniciansApi } from "../api/technicians-api";
import type { ListTechniciansRequest } from "@shared-types/ipc";

export const techniciansQueryKeys = {
  all: ["technicians"] as const,
  list: (params: ListTechniciansRequest) => [...techniciansQueryKeys.all, "list", params] as const,
  allCatalog: () => [...techniciansQueryKeys.all, "all"] as const,
};

/** Listă completă — pentru dropdown-uri în formulare */
export function useTechnicians(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: techniciansQueryKeys.allCatalog(),
    queryFn: async () => {
      const result = await techniciansApi.list({ all: true });
      return result.items;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/** Listă paginată — pentru pagina Tehnicieni */
export function useTechniciansList(params: ListTechniciansRequest) {
  return useQuery({
    queryKey: techniciansQueryKeys.list(params),
    queryFn: () => techniciansApi.list(params),
  });
}
