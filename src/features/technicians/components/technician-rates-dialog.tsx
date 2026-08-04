import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { parseRonInput } from "@/shared/lib/format";
import { technicianRatesApi } from "../api/technician-rates-api";
import type { TechnicianDto } from "@shared-types/ipc";

function baniToInput(bani: number): string {
  return (bani / 100).toFixed(2);
}

interface TechnicianRatesDialogProps {
  technician: TechnicianDto | null;
  onOpenChange: () => void;
}

export function TechnicianRatesDialog({ technician, onOpenChange }: TechnicianRatesDialogProps) {
  const [doctors, setDoctors] = React.useState<{ id: string; name: string }[]>([]);
  const [workTypes, setWorkTypes] = React.useState<{ id: string; name: string }[]>([]);
  const [cells, setCells] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!technician) return;
    setLoading(true);
    setError(null);
    technicianRatesApi
      .getRates(technician.id)
      .then((grid) => {
        setDoctors(grid.doctors);
        setWorkTypes(grid.workTypes);
        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(grid.prices)) {
          next[key] = value !== null ? baniToInput(value) : "";
        }
        setCells(next);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Eroare la încărcare.");
      })
      .finally(() => setLoading(false));
  }, [technician]);

  function cellKey(doctorId: string, workTypeId: string) {
    return `${doctorId}:${workTypeId}`;
  }

  async function handleSave() {
    if (!technician) return;
    setSaving(true);
    setError(null);
    try {
      const rates = doctors.flatMap((doctor) =>
        workTypes.map((wt) => ({
          doctorId: doctor.id,
          workTypeId: wt.id,
          pricePerUnit: cells[cellKey(doctor.id, wt.id)]?.trim()
            ? parseRonInput(cells[cellKey(doctor.id, wt.id)])
            : null,
        })),
      );
      await technicianRatesApi.saveRates({ technicianId: technician.id, rates });
      onOpenChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={technician !== null} onOpenChange={() => onOpenChange()}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grilă tarife — {technician?.name}</DialogTitle>
          <DialogDescription>
            Preț tehnician (RON/buc) per doctor/cabinet și tip lucrare — ca în Excel. Celulele goale
            folosesc prețul implicit din catalog la introducerea lucrărilor.
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

        {!loading && (doctors.length === 0 || workTypes.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Adaugă doctori și tipuri de lucrări înainte de a configura grila.
          </p>
        )}

        {!loading && doctors.length > 0 && workTypes.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="sticky left-0 z-10 bg-card px-2 py-2 text-left font-medium text-muted-foreground">
                    Doctor / Cabinet
                  </th>
                  {workTypes.map((wt) => (
                    <th
                      key={wt.id}
                      className="min-w-[72px] px-1 py-2 text-center font-medium text-muted-foreground"
                    >
                      {wt.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-border last:border-0">
                    <td className="sticky left-0 z-10 bg-background px-2 py-1.5 font-medium whitespace-nowrap">
                      {doctor.name}
                    </td>
                    {workTypes.map((wt) => {
                      const key = cellKey(doctor.id, wt.id);
                      return (
                        <td key={wt.id} className="px-1 py-1">
                          <Input
                            className="h-8 min-w-[64px] px-1 text-center text-xs"
                            placeholder="—"
                            value={cells[key] ?? ""}
                            onChange={(e) =>
                              setCells((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange()}>
            Anulează
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving || loading}>
            {saving ? "Se salvează..." : "Salvează grila"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
