import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  MaterialListItem,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  DeleteMaterialRequest,
  AdjustMaterialStockRequest,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as materialUseCases from "../application/material-use-cases";
import type { MaterialRecord } from "../infrastructure/materials-repository";

function toListItem(record: MaterialRecord): MaterialListItem {
  return {
    id: record.id,
    name: record.name,
    unit: record.unit,
    unitCost: record.unitCost,
    stockQuantity: record.stockQuantity,
    minStockQuantity: record.minStockQuantity,
  };
}

export function registerMaterialsHandlers(): void {
  registerIpcHandler<void, MaterialListItem[]>(IPC_CHANNELS.MATERIALS_LIST, async () => {
    const materials = await materialUseCases.listMaterials();
    return materials.map(toListItem);
  });

  registerIpcHandler<CreateMaterialRequest, MaterialListItem>(
    IPC_CHANNELS.MATERIALS_CREATE,
    async (payload) => {
      const material = await materialUseCases.createMaterial(payload);
      return toListItem(material);
    },
  );

  registerIpcHandler<UpdateMaterialRequest, MaterialListItem>(
    IPC_CHANNELS.MATERIALS_UPDATE,
    async (payload) => {
      const material = await materialUseCases.updateMaterial(payload.id, payload);
      return toListItem(material);
    },
  );

  registerIpcHandler<DeleteMaterialRequest, void>(IPC_CHANNELS.MATERIALS_DELETE, async (payload) => {
    await materialUseCases.deleteMaterial(payload.id);
  });

  registerIpcHandler<AdjustMaterialStockRequest, MaterialListItem>(
    IPC_CHANNELS.MATERIALS_ADJUST_STOCK,
    async (payload) => {
      const material = await materialUseCases.adjustMaterialStock(payload.id, payload.delta);
      return toListItem(material);
    },
  );
}
