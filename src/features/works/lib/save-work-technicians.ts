import { ratesApi } from "@/features/rates/api/rates-api";
import { worksApi } from "@/features/works/api/works-api";
import type { WorkListItem } from "@shared-types/ipc";

export interface TechnicianDraft {
  technician1Id: string;
  technician1Name: string | null;
  technician2Id: string;
  technician2Name: string | null;
  technician3Id: string;
  technician3Name: string | null;
}

export function draftFromWorkListItem(work: WorkListItem): TechnicianDraft {
  return {
    technician1Id: work.technician1Id ?? "",
    technician1Name: work.technician1Name,
    technician2Id: work.technician2Id ?? "",
    technician2Name: work.technician2Name,
    technician3Id: work.technician3Id ?? "",
    technician3Name: work.technician3Name,
  };
}

export async function saveWorkTechniciansFromListItem(
  work: WorkListItem,
  draft: TechnicianDraft,
): Promise<WorkListItem> {
  const full = await worksApi.get(work.id);
  if (full.lines.length === 0) {
    throw new Error("Lucrarea nu are linii de salvat.");
  }

  const lines = await Promise.all(
    full.lines.map(async (line, index) => {
      const isPrimaryLine = index === 0;
      const technicianId = isPrimaryLine ? draft.technician1Id || undefined : line.technicianId ?? undefined;
      const technician2Id = isPrimaryLine ? draft.technician2Id || undefined : line.technician2Id ?? undefined;
      const technician3Id = isPrimaryLine ? draft.technician3Id || undefined : line.technician3Id ?? undefined;

      let technicianUnitPrice = line.technicianUnitPrice;
      if (
        isPrimaryLine &&
        technicianId &&
        (technicianId !== (line.technicianId ?? "") || technicianUnitPrice === 0)
      ) {
        try {
          const prices = await ratesApi.lookupLinePrices({
            doctorId: full.doctorId,
            workTypeId: line.workTypeId,
            technicianId,
          });
          if (prices.technicianUnitPrice > 0) {
            technicianUnitPrice = prices.technicianUnitPrice;
          }
        } catch {
          // Păstrăm prețul existent dacă lookup eșuează.
        }
      }

      return {
        workTypeId: line.workTypeId,
        technicianId,
        technician2Id,
        technician3Id,
        quantity: line.quantity,
        doctorUnitPrice: line.doctorUnitPrice,
        technicianUnitPrice,
      };
    }),
  );

  const updated = await worksApi.update({
    id: full.id,
    entryDate: full.entryDate.slice(0, 10),
    patientName: full.patientName,
    observations: full.observations ?? undefined,
    paymentStatus: full.paymentStatus,
    doctorId: full.doctorId,
    lines,
  });

  const primary = updated.lines[0];
  return {
    ...work,
    technician1Id: primary?.technicianId ?? null,
    technician1Name: primary?.technicianName ?? null,
    technician2Id: primary?.technician2Id ?? null,
    technician2Name: primary?.technician2Name ?? null,
    technician3Id: primary?.technician3Id ?? null,
    technician3Name: primary?.technician3Name ?? null,
    doctorTotal: updated.doctorTotal,
    technicianTotal: updated.technicianTotal,
    workSummary: updated.lines.map((l) => `${l.quantity}× ${l.workTypeName}`).join(", "),
  };
}
