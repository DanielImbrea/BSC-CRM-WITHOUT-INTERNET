import { useMutation, useQueryClient } from "@tanstack/react-query";
import { worksApi } from "../api/works-api";
import { worksQueryKeys } from "./use-works";
import type {
  CreateWorkRequest,
  PaymentStatus,
  SearchWorksFilters,
  UpdateWorkRequest,
} from "@shared-types/ipc";

export function useCreateWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkRequest) => worksApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useUpdateWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkRequest) => worksApi.update(payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.detail(updated.id) });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useUpdateWorkPaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) =>
      worksApi.updatePaymentStatus({ id, paymentStatus }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.detail(updated.id) });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useDeleteWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => worksApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useSearchWorks() {
  return useMutation({
    mutationFn: (filters: SearchWorksFilters) => worksApi.search(filters),
  });
}
