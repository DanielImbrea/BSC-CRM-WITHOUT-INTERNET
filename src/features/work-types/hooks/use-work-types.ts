import { useQuery } from "@tanstack/react-query";
import { workTypesApi } from "../api/work-types-api";

export const workTypesQueryKeys = {
  all: ["work-types"] as const,
  list: () => [...workTypesQueryKeys.all, "list"] as const,
};

export function useWorkTypes() {
  return useQuery({
    queryKey: workTypesQueryKeys.list(),
    queryFn: workTypesApi.list,
  });
}
