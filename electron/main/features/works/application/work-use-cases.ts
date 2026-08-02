import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../../shared/db";
import { worksRepository, type WorkDetailRecord, type WorkListRecord } from "../infrastructure/works-repository";
import { materialsRepository, type MaterialRecord } from "../../materials/infrastructure/materials-repository";
import { assertWorkIsValid, type WorkInput } from "../domain/work-validation";
import { NotFoundError } from "../../../shared/errors";
import { recordAuditEvent } from "../../audit-log/application/record-audit-event";
import { AUDIT_ACTIONS } from "../../audit-log/domain/audit-action";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";
import type { WorkStatus } from "@shared-types/ipc";
import type { DbClient } from "../../../shared/db";

async function resolveMaterialByName(name: string, tx: DbClient): Promise<MaterialRecord> {
  const trimmed = name.trim();
  const existing = await materialsRepository.findByName(trimmed, tx);
  if (existing) return existing;

  return materialsRepository.create(
    { name: trimmed, unit: "buc", unitCost: 0, stockQuantity: 0, minStockQuantity: 0 },
    tx,
  );
}

export async function listWorks(): Promise<WorkListRecord[]> {
  requireAuthenticated();
  return worksRepository.findAll();
}

export async function getWork(id: string): Promise<WorkDetailRecord> {
  requireAuthenticated();
  const work = await worksRepository.findById(id);
  if (!work) {
    throw new NotFoundError("Work", id);
  }
  return work;
}

/**
 * Creează o Lucrare împreună cu materialele consumate și costurile asociate,
 * totul într-o singură tranzacție: dacă orice pas eșuează (client invalid etc.),
 * NU rămâne nimic scris în baza de date.
 * Materialele noi (nume libere) sunt create automat în stoc.
 */
export async function createWork(input: WorkInput): Promise<WorkDetailRecord> {
  requireAuthenticated();
  assertWorkIsValid(input);

  const db = getPrismaClient();

  const workId = await db.$transaction(async (tx) => {
    const materialSnapshots: { materialId: string; quantity: number; unitCost: number }[] = [];

    for (const line of input.materials) {
      const material = await resolveMaterialByName(line.materialName, tx);
      materialSnapshots.push({
        materialId: material.id,
        quantity: line.quantity,
        unitCost: material.unitCost,
      });
    }

    let createdWork: { id: string };
    try {
      createdWork = await worksRepository.createWork(input.title, input.clientId, tx);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new NotFoundError("Client", input.clientId);
      }
      throw error;
    }

    for (const snapshot of materialSnapshots) {
      await worksRepository.addWorkMaterial(
        createdWork.id,
        snapshot.materialId,
        snapshot.quantity,
        snapshot.unitCost,
        tx,
      );
      await materialsRepository.adjustStock(snapshot.materialId, -snapshot.quantity, tx);
    }

    for (const cost of input.costs) {
      await worksRepository.addCostEntry(createdWork.id, cost.description, cost.amount, cost.category, tx);
    }

    return createdWork.id;
  });

  const created = await worksRepository.findById(workId);
  if (!created) {
    // Nu ar trebui să se întâmple niciodată — tranzacția tocmai a reușit.
    throw new Error("Lucrarea a fost creată dar nu a putut fi regăsită imediat după.");
  }
  return created;
}

export async function updateWorkStatus(id: string, status: WorkStatus): Promise<WorkDetailRecord> {
  requireAuthenticated();
  const existing = await worksRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Work", id);
  }

  const finishedAt = status === "COMPLETED" ? new Date() : status === "IN_PROGRESS" ? null : existing.finishedAt;
  await worksRepository.updateStatus(id, status, finishedAt);

  const updated = await worksRepository.findById(id);
  if (!updated) {
    throw new Error("Lucrarea nu a putut fi regăsită după actualizare.");
  }
  return updated;
}

/**
 * Șterge o Lucrare și restaurează în stoc materialele consumate de ea —
 * altfel stocul ar rămâne permanent "consumat" pentru o lucrare care nu
 * mai există. Costurile asociate NU se șterg (rămân ca istoric financiar,
 * doar se decuplează de la lucrare — vezi onDelete: SetNull în schemă).
 */
export async function deleteWork(id: string): Promise<void> {
  requireAuthenticated();
  const existing = await worksRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Work", id);
  }

  const db = getPrismaClient();
  await db.$transaction(async (tx) => {
    const materials = await worksRepository.listWorkMaterials(id, tx);
    for (const line of materials) {
      await materialsRepository.adjustStock(line.materialId, line.quantity, tx);
    }
    await worksRepository.deleteById(id, tx);
  });

  await recordAuditEvent({
    action: AUDIT_ACTIONS.DELETE,
    entityType: "Work",
    entityId: id,
    before: existing,
  });
}
