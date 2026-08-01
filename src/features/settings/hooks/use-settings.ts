import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings-api";
import type { AppSettingsDto } from "@shared-types/ipc";

export const settingsQueryKeys = {
  all: ["settings"] as const,
};

export function useAppSettings() {
  return useQuery({
    queryKey: settingsQueryKeys.all,
    queryFn: settingsApi.get,
  });
}

export function useUpdateAppSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AppSettingsDto) => settingsApi.update(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all }),
  });
}
