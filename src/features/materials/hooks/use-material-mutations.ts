import { useMutation, useQueryClient } from "@tanstack/react-query";
import { materialsApi } from "../api/materials-api";
import { materialsQueryKeys } from "./use-materials";
import type { CreateMaterialRequest, UpdateMaterialRequest } from "@shared-types/ipc";

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMaterialRequest) => materialsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: materialsQueryKeys.list() });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMaterialRequest) => materialsApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: materialsQueryKeys.list() });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: materialsQueryKeys.list() });
    },
  });
}

export function useAdjustMaterialStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) => materialsApi.adjustStock(id, delta),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: materialsQueryKeys.list() });
    },
  });
}
