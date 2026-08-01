import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../api/clients-api";

export const clientsQueryKeys = {
  all: ["clients"] as const,
  list: () => [...clientsQueryKeys.all, "list"] as const,
  detail: (id: string) => [...clientsQueryKeys.all, "detail", id] as const,
};

export function useClients() {
  return useQuery({
    queryKey: clientsQueryKeys.list(),
    queryFn: clientsApi.list,
  });
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: clientsQueryKeys.detail(id ?? ""),
    queryFn: () => clientsApi.get(id as string),
    enabled: id !== null,
  });
}
