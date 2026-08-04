import { useQuery } from "@tanstack/react-query";
import { doctorsApi } from "../api/doctors-api";
import type { ListDoctorsRequest } from "@shared-types/ipc";

export const doctorsQueryKeys = {
  all: ["doctors"] as const,
  list: (params: ListDoctorsRequest) => [...doctorsQueryKeys.all, "list", params] as const,
  allCatalog: () => [...doctorsQueryKeys.all, "all"] as const,
  detail: (id: string) => [...doctorsQueryKeys.all, "detail", id] as const,
};

/** Listă completă — pentru dropdown-uri în formulare */
export function useDoctors(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: doctorsQueryKeys.allCatalog(),
    queryFn: async () => {
      const result = await doctorsApi.list({ all: true });
      return result.items;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/** Listă paginată — pentru pagina Doctori */
export function useDoctorsList(params: ListDoctorsRequest) {
  return useQuery({
    queryKey: doctorsQueryKeys.list(params),
    queryFn: () => doctorsApi.list(params),
  });
}

export function useDoctor(id: string | null) {
  return useQuery({
    queryKey: doctorsQueryKeys.detail(id ?? ""),
    queryFn: () => doctorsApi.get(id as string),
    enabled: id !== null,
  });
}
