import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workTypesApi } from "../api/work-types-api";
import { workTypesQueryKeys } from "./use-work-types";
import type { CreateWorkTypeRequest, UpdateWorkTypeRequest } from "@shared-types/ipc";

export function useCreateWorkType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkTypeRequest) => workTypesApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workTypesQueryKeys.list() });
    },
  });
}

export function useUpdateWorkType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkTypeRequest) => workTypesApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workTypesQueryKeys.list() });
    },
  });
}

export function useDeleteWorkType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workTypesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workTypesQueryKeys.list() });
    },
  });
}
