import { useMutation, useQueryClient } from "@tanstack/react-query";
import { salariesApi } from "../api/salaries-api";
import { salariesQueryKeys } from "./use-salaries";
import type { CreateSalaryRequest, UpdateSalaryRequest } from "@shared-types/ipc";

export function useCreateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalaryRequest) => salariesApi.create(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: salariesQueryKeys.all }),
  });
}

export function useUpdateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSalaryRequest) => salariesApi.update(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: salariesQueryKeys.all }),
  });
}

export function useDeleteSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salariesApi.delete(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: salariesQueryKeys.all }),
  });
}
