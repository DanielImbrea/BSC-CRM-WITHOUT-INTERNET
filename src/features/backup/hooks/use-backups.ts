import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backupApi } from "../api/backup-api";

export const backupQueryKeys = {
  all: ["backups"] as const,
  list: () => [...backupQueryKeys.all, "list"] as const,
};

export function useBackups() {
  return useQuery({
    queryKey: backupQueryKeys.list(),
    queryFn: backupApi.list,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: backupApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: backupQueryKeys.list() }),
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => backupApi.restore(id),
    onSuccess: () => void queryClient.invalidateQueries(),
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => backupApi.delete(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: backupQueryKeys.list() }),
  });
}

export function useExportBackup() {
  return useMutation({
    mutationFn: (id: string) => backupApi.exportBackup(id),
  });
}

export function useImportAndRestore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: backupApi.importAndRestore,
    onSuccess: (result) => {
      if (result.restoredFrom) {
        void queryClient.invalidateQueries();
      }
    },
  });
}
