import type {
  MaterialListItem,
  CreateMaterialRequest,
  UpdateMaterialRequest,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const materialsApi = {
  async list(): Promise<MaterialListItem[]> {
    return unwrapIpc(await window.labManager.materials.list());
  },
  async create(payload: CreateMaterialRequest): Promise<MaterialListItem> {
    return unwrapIpc(await window.labManager.materials.create(payload));
  },
  async update(payload: UpdateMaterialRequest): Promise<MaterialListItem> {
    return unwrapIpc(await window.labManager.materials.update(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.materials.delete({ id }));
  },
  async adjustStock(id: string, delta: number): Promise<MaterialListItem> {
    return unwrapIpc(await window.labManager.materials.adjustStock({ id, delta }));
  },
};
