import { Prisma } from "@prisma/client";
import { materialsRepository, type MaterialRecord } from "../infrastructure/materials-repository";
import {
  assertMaterialIsValid,
  assertStockAdjustmentIsValid,
  type MaterialInput,
} from "../domain/material-validation";
import { NotFoundError, ConflictError } from "../../../shared/errors";
import { recordAuditEvent } from "../../audit-log/application/record-audit-event";
import { AUDIT_ACTIONS } from "../../audit-log/domain/audit-action";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

async function assertNameIsUnique(name: string, excludeId?: string): Promise<void> {
  const existing = await materialsRepository.findByName(name);
  if (existing && existing.id !== excludeId) {
    throw new ConflictError(`Există deja un material cu numele "${name}".`);
  }
}

export async function listMaterials(): Promise<MaterialRecord[]> {
  requireAuthenticated();
  return materialsRepository.findAll();
}

export async function createMaterial(input: MaterialInput): Promise<MaterialRecord> {
  requireAuthenticated();
  assertMaterialIsValid(input);
  await assertNameIsUnique(input.name);
  return materialsRepository.create(input);
}

export async function updateMaterial(id: string, input: MaterialInput): Promise<MaterialRecord> {
  requireAuthenticated();
  assertMaterialIsValid(input);
  const existing = await materialsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Material", id);
  }
  await assertNameIsUnique(input.name, id);
  return materialsRepository.update(id, input);
}

export async function deleteMaterial(id: string): Promise<void> {
  requireAuthenticated();
  const existing = await materialsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Material", id);
  }

  try {
    await materialsRepository.delete(id);
  } catch (error) {
    // Constrângere de foreign key (WorkMaterial.materialId -> Restrict): materialul a fost folosit în lucrări.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2014")
    ) {
      throw new ConflictError(
        `Materialul "${existing.name}" a fost folosit în cel puțin o lucrare și nu poate fi șters.`,
      );
    }
    throw error;
  }

  await recordAuditEvent({
    action: AUDIT_ACTIONS.DELETE,
    entityType: "Material",
    entityId: id,
    before: existing,
  });
}

/**
 * Ajustare manuală de stoc (ex: recepție marfă, corecție inventar).
 * Nu e o acțiune "critică" în sensul politicii de audit convenite
 * (doar ștergeri, salarii, autentificare, backup) — nu se loghează.
 */
export async function adjustMaterialStock(id: string, delta: number): Promise<MaterialRecord> {
  requireAuthenticated();
  const existing = await materialsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Material", id);
  }
  assertStockAdjustmentIsValid(existing.stockQuantity, delta);
  return materialsRepository.adjustStock(id, delta);
}
