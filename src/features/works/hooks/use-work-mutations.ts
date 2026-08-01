import { useMutation, useQueryClient } from "@tanstack/react-query";
import { worksApi } from "../api/works-api";
import { worksQueryKeys } from "./use-works";
import { materialsQueryKeys } from "@/features/materials/hooks/use-materials";
import type { CreateWorkRequest, WorkStatus } from "@shared-types/ipc";

export function useCreateWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkRequest) => worksApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.list() });
      // Crearea unei lucrări consumă materiale — stocul afișat în Materiale trebuie reîmprospătat.
      void queryClient.invalidateQueries({ queryKey: materialsQueryKeys.list() });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useUpdateWorkStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkStatus }) => worksApi.updateStatus(id, status),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.list() });
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
      void queryClient.invalidateQueries({ queryKey: worksQueryKeys.list() });
      // Ștergerea unei lucrări restaurează stocul materialelor consumate.
      void queryClient.invalidateQueries({ queryKey: materialsQueryKeys.list() });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}
