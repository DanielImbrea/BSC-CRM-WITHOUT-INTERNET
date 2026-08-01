import { useMutation, useQueryClient } from "@tanstack/react-query";
import { costsApi } from "../api/costs-api";
import { costsQueryKeys } from "./use-costs";
import type { CreateCostRequest, UpdateCostRequest } from "@shared-types/ipc";

export function useCreateCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCostRequest) => costsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: costsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useUpdateCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCostRequest) => costsApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: costsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useDeleteCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => costsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: costsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}
