import { doctorsApi } from "@/features/doctors/api/doctors-api";
import { techniciansApi } from "@/features/technicians/api/technicians-api";
import { workTypesApi } from "@/features/work-types/api/work-types-api";
import type { EntityOption } from "@/shared/components/searchable-entity-select";

export async function loadDoctorOptions(): Promise<EntityOption[]> {
  const result = await doctorsApi.list({ all: true });
  return result.items.map((d) => ({ id: d.id, label: d.name }));
}

export async function loadActiveTechnicianOptions(): Promise<EntityOption[]> {
  const result = await techniciansApi.list({ all: true });
  return result.items.filter((t) => t.active).map((t) => ({ id: t.id, label: t.name }));
}

export async function loadWorkTypeOptions(): Promise<EntityOption[]> {
  const result = await workTypesApi.list({ all: true });
  return result.items.map((wt) => ({ id: wt.id, label: wt.name }));
}
