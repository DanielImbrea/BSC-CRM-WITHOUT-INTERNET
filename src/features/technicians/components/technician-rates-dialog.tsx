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

const MAX_FILTERED_COLUMNS = 40;
/** Sub acest număr afișăm toate coloanele (ex. 42 tipuri la secretară). */
const FULL_GRID_WORK_TYPE_LIMIT = 150;

function baniToInput(bani: number): string {
  return (bani / 100).toFixed(2);
}

function cellKey(doctorId: string, workTypeId: string) {
  return `${doctorId}:${workTypeId}`;
}

function useSyncedHorizontalScroll(tableWidth: number) {
  const gridScrollRef = React.useRef<HTMLDivElement>(null);
  const bottomScrollRef = React.useRef<HTMLDivElement>(null);
  const syncingRef = React.useRef(false);

  const syncScrollLeft = React.useCallback((source: HTMLDivElement, target: HTMLDivElement | null) => {
    if (!target || syncingRef.current) return;
    syncingRef.current = true;
    target.scrollLeft = source.scrollLeft;
    syncingRef.current = false;
  }, []);

  const onGridScroll = React.useCallback(() => {
    const grid = gridScrollRef.current;
    if (!grid) return;
    syncScrollLeft(grid, bottomScrollRef.current);
  }, [syncScrollLeft]);

  const onBottomScroll = React.useCallback(() => {
    const bottom = bottomScrollRef.current;
    if (!bottom) return;
    syncScrollLeft(bottom, gridScrollRef.current);
  }, [syncScrollLeft]);

  React.useEffect(() => {
    onGridScroll();
  }, [tableWidth, onGridScroll]);

  return { gridScrollRef, bottomScrollRef, onGridScroll, onBottomScroll };
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

    if (term) {
      return workTypes
        .filter((wt) => wt.name.toLowerCase().includes(term))
        .slice(0, MAX_FILTERED_COLUMNS);
    }

    if (workTypes.length <= FULL_GRID_WORK_TYPE_LIMIT) {
      return workTypes;
    }

    return workTypes.slice(0, MAX_FILTERED_COLUMNS);
  }, [workTypes, workTypeFilter]);

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

  const showWorkTypeHint =
    !loading &&
    workTypes.length > FULL_GRID_WORK_TYPE_LIMIT &&
    workTypeFilter.trim().length > 0 &&
    visibleWorkTypes.length === 0;

  const isHugeCatalog = workTypes.length > FULL_GRID_WORK_TYPE_LIMIT;

  const tableRef = React.useRef<HTMLTableElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = React.useState(0);
  const { gridScrollRef, bottomScrollRef, onGridScroll, onBottomScroll } =
    useSyncedHorizontalScroll(tableScrollWidth);

  React.useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table) {
      setTableScrollWidth(0);
      return;
    }

    const updateWidth = () => setTableScrollWidth(table.scrollWidth);

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(table);
    return () => observer.disconnect();
  }, [visibleDoctors.length, visibleWorkTypes.length, cells]);

  return (
    <Dialog open={technician !== null} onOpenChange={() => onOpenChange()}>
      <DialogContent className="flex h-[min(90vh,820px)] max-w-5xl flex-col gap-3 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Grilă tarife — {technician?.name}</DialogTitle>
          <DialogDescription>
            Preț tehnician (RON/buc) per doctor și tip lucrare — ca în Excel.
            {isHugeCatalog && (
              <>
                {" "}
                Catalogul are {workTypes.length.toLocaleString("ro-RO")} tipuri lucrări; folosește
                căutarea pentru coloane (max. {MAX_FILTERED_COLUMNS} odată).
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

        {!loading && (doctors.length === 0 || workTypes.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Adaugă doctori și tipuri de lucrări înainte de a configura grila.
          </p>
        )}

        {!loading && doctors.length > 0 && workTypes.length > 0 && (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 print:hidden">
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
                Niciun tip de lucrare nu corespunde căutării. Încearcă alt termen (ex. coroana,
                zirconiu).
              </p>
            )}

            {visibleWorkTypes.length > 0 && (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border">
                <div
                  ref={gridScrollRef}
                  className="rates-grid-scroll-y min-h-0 flex-1"
                  onScroll={onGridScroll}
                >
                  <table
                    ref={tableRef}
                    className="min-w-full border-separate border-spacing-0 text-xs"
                  >
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
                <div
                  ref={bottomScrollRef}
                  className="rates-grid-scroll-x border-t border-border bg-muted/40"
                  onScroll={onBottomScroll}
                  aria-label="Scroll orizontal grilă"
                >
                  <div style={{ width: Math.max(tableScrollWidth, 1), height: 12 }} />
                </div>
              </div>
            )}

            {visibleWorkTypes.length > 0 && (
              <p className="shrink-0 text-xs text-muted-foreground print:hidden">
                {visibleDoctors.length.toLocaleString("ro-RO")} doctori ·{" "}
                {visibleWorkTypes.length.toLocaleString("ro-RO")} tipuri lucrări afișate
              </p>
            )}
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter className="shrink-0">
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
