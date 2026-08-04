import { useMutation, useQueryClient } from "@tanstack/react-query";
import { techniciansApi } from "../api/technicians-api";
import { techniciansQueryKeys } from "./use-technicians";
import type { CreateTechnicianRequest, UpdateTechnicianRequest } from "@shared-types/ipc";

export function useCreateTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTechnicianRequest) => techniciansApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: techniciansQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useUpdateTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTechnicianRequest) => techniciansApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: techniciansQueryKeys.all });
    },
  });
}

export function useDeleteTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => techniciansApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: techniciansQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}
