import { useQuery } from "@tanstack/react-query";
import { worksApi } from "../api/works-api";
import type { ListWorksRequest, SearchWorksFilters } from "@shared-types/ipc";

export const worksQueryKeys = {
  all: ["works"] as const,
  list: (params: ListWorksRequest) => [...worksQueryKeys.all, "list", params] as const,
  search: (filters: SearchWorksFilters) => [...worksQueryKeys.all, "search", filters] as const,
  detail: (id: string) => [...worksQueryKeys.all, "detail", id] as const,
};

export function useWorksList(params: ListWorksRequest) {
  return useQuery({
    queryKey: worksQueryKeys.list(params),
    queryFn: () => worksApi.list(params),
  });
}

export function useWork(id: string | null) {
  return useQuery({
    queryKey: worksQueryKeys.detail(id ?? ""),
    queryFn: () => worksApi.get(id as string),
    enabled: id !== null,
  });
}
