import { useQuery } from "@tanstack/react-query";
import { doctorsApi } from "../api/doctors-api";

export const doctorsQueryKeys = {
  all: ["doctors"] as const,
  list: () => [...doctorsQueryKeys.all, "list"] as const,
  detail: (id: string) => [...doctorsQueryKeys.all, "detail", id] as const,
};

export function useDoctors() {
  return useQuery({
    queryKey: doctorsQueryKeys.list(),
    queryFn: doctorsApi.list,
  });
}

export function useDoctor(id: string | null) {
  return useQuery({
    queryKey: doctorsQueryKeys.detail(id ?? ""),
    queryFn: () => doctorsApi.get(id as string),
    enabled: id !== null,
  });
}
