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
import { Label } from "@/shared/components/ui/label";
import { parseRonInput } from "@/shared/lib/format";
import { technicianRatesApi } from "../api/technician-rates-api";
import type { RateGridCell, TechnicianDto } from "@shared-types/ipc";

const MAX_VISIBLE_WORK_TYPES = 40;

function baniToInput(bani: number): string {
  return (bani / 100).toFixed(2);
}

function cellKey(doctorId: string, workTypeId: string) {
  return `${doctorId}:${workTypeId}`;
}

function workTypeIdsFromPrices(prices: Record<string, number>): Set<string> {
  const ids = new Set<string>();
  for (const key of Object.keys(prices)) {
    const workTypeId = key.split(":")[1];
    if (workTypeId) ids.add(workTypeId);
  }
  return ids;
}

interface TechnicianRatesDialogProps {
  technician: TechnicianDto | null;
  onOpenChange: () => void;
}

export function TechnicianRatesDialog({ technician, onOpenChange }: TechnicianRatesDialogProps) {
  const [doctors, setDoctors] = React.useState<{ id: string; name: string }[]>([]);
  const [workTypes, setWorkTypes] = React.useState<{ id: string; name: string }[]>([]);
  const [cells, setCells] = React.useState<Record<string, string>>({});
  const [doctorFilter, setDoctorFilter] = React.useState("");
  const [workTypeFilter, setWorkTypeFilter] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const initialPriceKeysRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!technician) {
      setDoctors([]);
      setWorkTypes([]);
      setCells({});
      setDoctorFilter("");
      setWorkTypeFilter("");
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    technicianRatesApi
      .getRates(technician.id)
      .then((grid) => {
        if (cancelled) return;
        setDoctors(grid.doctors);
        setWorkTypes(grid.workTypes);
        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(grid.prices)) {
          next[key] = baniToInput(value);
        }
        initialPriceKeysRef.current = new Set(Object.keys(grid.prices));
        setCells(next);

        const presetWorkTypeIds = workTypeIdsFromPrices(grid.prices);
        if (presetWorkTypeIds.size > 0) {
          const first = grid.workTypes.find((wt) => presetWorkTypeIds.has(wt.id));
          if (first) setWorkTypeFilter(first.name.slice(0, Math.min(8, first.name.length)));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Eroare la încărcare.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [technician]);

  const visibleDoctors = React.useMemo(() => {
    const term = doctorFilter.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter((doctor) => doctor.name.toLowerCase().includes(term));
  }, [doctors, doctorFilter]);

  const visibleWorkTypes = React.useMemo(() => {
    const term = workTypeFilter.trim().toLowerCase();
    const pricedIds = workTypeIdsFromPrices(
      Object.fromEntries(
        Object.entries(cells)
          .filter(([, value]) => value.trim())
          .map(([key, value]) => [key, parseRonInput(value)]),
      ),
    );

    if (!term) {
      if (pricedIds.size === 0) return [];
      return workTypes.filter((wt) => pricedIds.has(wt.id)).slice(0, MAX_VISIBLE_WORK_TYPES);
    }

    return workTypes
      .filter((wt) => wt.name.toLowerCase().includes(term))
      .slice(0, MAX_VISIBLE_WORK_TYPES);
  }, [workTypes, workTypeFilter, cells]);

  async function handleSave() {
    if (!technician) return;
    setSaving(true);
    setError(null);
    try {
      const rates: RateGridCell[] = Object.entries(cells)
        .filter(([, value]) => value.trim())
        .map(([key, value]) => {
          const [doctorId, workTypeId] = key.split(":");
          return {
            doctorId,
            workTypeId,
            pricePerUnit: parseRonInput(value),
          };
        })
        .filter((rate) => rate.doctorId && rate.workTypeId);

      for (const key of initialPriceKeysRef.current) {
        if (!cells[key]?.trim()) {
          const [doctorId, workTypeId] = key.split(":");
          if (doctorId && workTypeId) {
            rates.push({ doctorId, workTypeId, pricePerUnit: null });
          }
        }
      }

      await technicianRatesApi.saveRates({ technicianId: technician.id, rates });
      onOpenChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  const showWorkTypeHint = !loading && workTypes.length > 0 && visibleWorkTypes.length === 0;

  return (
    <Dialog open={technician !== null} onOpenChange={() => onOpenChange()}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Grilă tarife — {technician?.name}</DialogTitle>
          <DialogDescription>
            Preț tehnician (RON/buc) per doctor și tip lucrare. Folosește filtrele — catalogul are{" "}
            {workTypes.length.toLocaleString("ro-RO")} tipuri lucrări; se afișează max.{" "}
            {MAX_VISIBLE_WORK_TYPES} coloane odată.
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

        {!loading && (doctors.length === 0 || workTypes.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Adaugă doctori și tipuri de lucrări înainte de a configura grila.
          </p>
        )}

        {!loading && doctors.length > 0 && workTypes.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 print:hidden">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="doctorGridFilter">Filtrează doctor / cabinet</Label>
                <Input
                  id="doctorGridFilter"
                  placeholder="ex. AMC, Andrei..."
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workTypeGridFilter">Caută tip lucrare (coloane)</Label>
                <Input
                  id="workTypeGridFilter"
                  placeholder="ex. coroana, zirconiu, surfasaj..."
                  value={workTypeFilter}
                  onChange={(e) => setWorkTypeFilter(e.target.value)}
                />
              </div>
            </div>

            {showWorkTypeHint && (
              <p className="text-sm text-muted-foreground">
                Caută un tip de lucrare mai sus pentru a afișa coloanele. Grila nu poate încărca
                mii de coloane simultan.
              </p>
            )}

            {visibleWorkTypes.length > 0 && (
              <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
                <table className="min-w-full border-separate border-spacing-0 text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 top-0 z-30 min-w-[140px] border-b border-r border-border bg-card px-2 py-2 text-left font-medium text-muted-foreground shadow-[2px_2px_4px_-2px_rgba(0,0,0,0.15)]">
                        Doctor / Cabinet
                      </th>
                      {visibleWorkTypes.map((wt) => (
                        <th
                          key={wt.id}
                          className="sticky top-0 z-20 min-w-[72px] max-w-[120px] border-b border-border bg-card px-1 py-2 text-center font-medium text-muted-foreground shadow-[0_2px_4px_-2px_rgba(0,0,0,0.12)]"
                          title={wt.name}
                        >
                          <span className="line-clamp-2">{wt.name}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDoctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td className="sticky left-0 z-10 border-b border-r border-border bg-background px-2 py-1.5 font-medium whitespace-nowrap shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)]">
                          {doctor.name}
                        </td>
                        {visibleWorkTypes.map((wt) => {
                          const key = cellKey(doctor.id, wt.id);
                          return (
                            <td key={wt.id} className="border-b border-border px-1 py-1">
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

            {visibleWorkTypes.length > 0 && (
              <p className="text-xs text-muted-foreground print:hidden">
                {visibleDoctors.length.toLocaleString("ro-RO")} doctori ·{" "}
                {visibleWorkTypes.length.toLocaleString("ro-RO")} tipuri lucrări afișate
              </p>
            )}
          </>
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
