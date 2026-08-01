import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "../api/employees-api";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "@shared-types/ipc";

export const employeesQueryKeys = {
  all: ["employees"] as const,
  list: () => [...employeesQueryKeys.all, "list"] as const,
};

export function useEmployees() {
  return useQuery({
    queryKey: employeesQueryKeys.list(),
    queryFn: employeesApi.list,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeeRequest) => employeesApi.create(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: employeesQueryKeys.list() }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEmployeeRequest) => employeesApi.update(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: employeesQueryKeys.list() }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: employeesQueryKeys.list() }),
  });
}
