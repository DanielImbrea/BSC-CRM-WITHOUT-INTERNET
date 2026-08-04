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
import { doctorRatesApi } from "../api/doctor-rates-api";
import type { DoctorListItem } from "@shared-types/ipc";

function baniToInput(bani: number): string {
  return (bani / 100).toFixed(2);
}

interface DoctorRatesDialogProps {
  doctor: DoctorListItem | null;
  onOpenChange: () => void;
}

export function DoctorRatesDialog({ doctor, onOpenChange }: DoctorRatesDialogProps) {
  const [rows, setRows] = React.useState<{ workTypeId: string; workTypeName: string; price: string }[]>(
    [],
  );
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!doctor) return;
    setLoading(true);
    setError(null);
    doctorRatesApi
      .getRates(doctor.id)
      .then((data) => {
        setRows(
          data.map((row) => ({
            workTypeId: row.workTypeId,
            workTypeName: row.workTypeName,
            price: row.pricePerUnit !== null ? baniToInput(row.pricePerUnit) : "",
          })),
        );
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Eroare la încărcare.");
      })
      .finally(() => setLoading(false));
  }, [doctor]);

  async function handleSave() {
    if (!doctor) return;
    setSaving(true);
    setError(null);
    try {
      await doctorRatesApi.saveRates({
        doctorId: doctor.id,
        rates: rows.map((row) => ({
          workTypeId: row.workTypeId,
          pricePerUnit: row.price.trim() ? parseRonInput(row.price) : null,
        })),
      });
      onOpenChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={doctor !== null} onOpenChange={() => onOpenChange()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tarife cabinet — {doctor?.name}</DialogTitle>
          <DialogDescription>
            Preț per tip lucrare (RON/buc). La introducerea lucrărilor, aceste valori se completează
            automat. Celulele goale folosesc prețul implicit din catalogul de tipuri lucrări.
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Se încarcă...</p>}

        {!loading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Adaugă mai întâi tipuri de lucrări în catalog, apoi configurează tarifele aici.
          </p>
        )}

        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Tip lucrare</th>
                  <th className="px-3 py-2 font-medium text-right">Preț doctor (RON/buc)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.workTypeId} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium">{row.workTypeName}</td>
                    <td className="px-3 py-2">
                      <Input
                        className="ml-auto max-w-[120px] text-right"
                        placeholder="—"
                        value={row.price}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, price: e.target.value } : r)),
                          )
                        }
                      />
                    </td>
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
            {saving ? "Se salvează..." : "Salvează tarife"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
