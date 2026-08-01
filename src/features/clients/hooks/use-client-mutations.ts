import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../api/clients-api";
import { clientsQueryKeys } from "./use-clients";
import type { CreateClientRequest, UpdateClientRequest } from "@shared-types/ipc";

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientRequest) => clientsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientsQueryKeys.list() });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClientRequest) => clientsApi.update(payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: clientsQueryKeys.list() });
      void queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(updated.id) });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientsQueryKeys.list() });
    },
  });
}
