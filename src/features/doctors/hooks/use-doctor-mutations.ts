import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorsApi } from "../api/doctors-api";
import { doctorsQueryKeys } from "./use-doctors";
import type { CreateDoctorRequest, UpdateDoctorRequest } from "@shared-types/ipc";

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDoctorRequest) => doctorsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDoctorRequest) => doctorsApi.update(payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: doctorsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: doctorsQueryKeys.detail(updated.id) });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doctorsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}
