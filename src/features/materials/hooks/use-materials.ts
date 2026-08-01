import { useQuery } from "@tanstack/react-query";
import { materialsApi } from "../api/materials-api";

export const materialsQueryKeys = {
  all: ["materials"] as const,
  list: () => [...materialsQueryKeys.all, "list"] as const,
};

export function useMaterials() {
  return useQuery({
    queryKey: materialsQueryKeys.list(),
    queryFn: materialsApi.list,
  });
}
