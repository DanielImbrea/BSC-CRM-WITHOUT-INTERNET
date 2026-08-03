import { useQuery } from "@tanstack/react-query";
import { worksApi } from "../api/works-api";
import type { SearchWorksFilters } from "@shared-types/ipc";

export const worksQueryKeys = {
  all: ["works"] as const,
  list: () => [...worksQueryKeys.all, "list"] as const,
  search: (filters: SearchWorksFilters) => [...worksQueryKeys.all, "search", filters] as const,
  detail: (id: string) => [...worksQueryKeys.all, "detail", id] as const,
};

export function useWorks() {
  return useQuery({
    queryKey: worksQueryKeys.list(),
    queryFn: worksApi.list,
  });
}

export function useWork(id: string | null) {
  return useQuery({
    queryKey: worksQueryKeys.detail(id ?? ""),
    queryFn: () => worksApi.get(id as string),
    enabled: id !== null,
  });
}
