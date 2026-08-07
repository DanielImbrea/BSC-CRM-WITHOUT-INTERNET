import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { SearchableEntitySelect } from "@/shared/components/searchable-entity-select";
import {
  loadActiveTechnicianOptions,
  loadDoctorOptions,
  loadWorkTypeOptions,
} from "@/shared/lib/catalog-options";
import { parseRonInput } from "@/shared/lib/format";
import { ratesApi } from "@/features/rates/api/rates-api";
import { useWork } from "../hooks/use-works";
import { useCreateWork, useUpdateWork } from "../hooks/use-work-mutations";
import { PaymentStatusSelect } from "./payment-status-select";
import type { PaymentStatus } from "@shared-types/ipc";

interface WorkLineForm {
  key: string;
  workTypeId: string;
  workTypeName?: string;
  technicianId: string;
  technicianName?: string;
  technician2Id: string;
  technician2Name?: string;
  technician3Id: string;
  technician3Name?: string;
  quantity: string;
  doctorUnitPrice: string;
  technicianUnitPrice: string;
}

interface WorkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId?: string | null;
  /** Valori din listă pentru afișare instantă înainte de fetch-ul complet. */
  seed?: {
    doctorId?: string;
    doctorName?: string | null;
    patientName?: string;
  } | null;
}

function baniToInput(bani: number): string {
  return (bani / 100).toFixed(2);
}

function emptyLine(): WorkLineForm {
  return {
    key: crypto.randomUUID(),
    workTypeId: "",
    technicianId: "",
    technician2Id: "",
    technician3Id: "",
    quantity: "1",
    doctorUnitPrice: "",
    technicianUnitPrice: "",
  };
}

export function WorkFormDialog({ open, onOpenChange, workId = null, seed = null }: WorkFormDialogProps) {
  const isEditMode = workId !== null;
  const { data: existingWork, isLoading: isLoadingWork, isFetching } = useWork(isEditMode ? workId : null);
  const createWork = useCreateWork();
  const updateWork = useUpdateWork();

  const [entryDate, setEntryDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [doctorId, setDoctorId] = React.useState("");
  const [doctorName, setDoctorName] = React.useState<string | null>(null);
  const [patientName, setPatientName] = React.useState("");
  const [observations, setObservations] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>("NEPLATITA");
  const [lines, setLines] = React.useState<WorkLineForm[]>([emptyLine()]);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    if (open && isEditMode && existingWork) {
      setEntryDate(existingWork.entryDate.slice(0, 10));
      setDoctorId(existingWork.doctorId);
      setDoctorName(existingWork.doctorName);
      setPatientName(existingWork.patientName);
      setObservations(existingWork.observations ?? "");
      setPaymentStatus(existingWork.paymentStatus);
      setLines(
        existingWork.lines.length > 0
          ? existingWork.lines.map((line) => ({
              key: line.id,
              workTypeId: line.workTypeId,
              workTypeName: line.workTypeName,
              technicianId: line.technicianId ?? "",
              technicianName: line.technicianName ?? undefined,
              technician2Id: line.technician2Id ?? "",
              technician2Name: line.technician2Name ?? undefined,
              technician3Id: line.technician3Id ?? "",
              technician3Name: line.technician3Name ?? undefined,
              quantity: String(line.quantity),
              doctorUnitPrice: baniToInput(line.doctorUnitPrice),
              technicianUnitPrice: baniToInput(line.technicianUnitPrice),
            }))
          : [emptyLine()],
      );
    } else if (open && isEditMode && seed && (isLoadingWork || isFetching) && !existingWork) {
      setDoctorId(seed.doctorId ?? "");
      setDoctorName(seed.doctorName ?? null);
      setPatientName(seed.patientName ?? "");
    } else if (open && !isEditMode) {
      setEntryDate(format(new Date(), "yyyy-MM-dd"));
      setDoctorId("");
      setDoctorName(null);
      setPatientName("");
      setObservations("");
      setPaymentStatus("NEPLATITA");
      setLines([emptyLine()]);
    }
    setFormError(null);
  }, [open, isEditMode, existingWork, isLoadingWork, isFetching, seed]);

  async function lookupAndApplyLinePrices(
    index: number,
    nextDoctorId: string,
    workTypeId: string,
    technicianId: string,
  ) {
    if (!nextDoctorId || !workTypeId) return;
    try {
      const prices = await ratesApi.lookupLinePrices({
        doctorId: nextDoctorId,
        workTypeId,
        technicianId: technicianId || undefined,
      });
      updateLine(index, {
        doctorUnitPrice: baniToInput(prices.doctorUnitPrice),
        technicianUnitPrice: baniToInput(prices.technicianUnitPrice),
      });
    } catch {
      updateLine(index, {
        doctorUnitPrice: "",
        technicianUnitPrice: "",
      });
    }
  }

  function updateLine(index: number, patch: Partial<WorkLineForm>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function applyLinePatch(index: number, patch: Partial<WorkLineForm>) {
    updateLine(index, patch);
  }

  function handleWorkTypeChange(index: number, workTypeId: string, workTypeName?: string) {
    applyLinePatch(index, {
      workTypeId,
      workTypeName: workTypeId ? (workTypeName ?? lines[index]?.workTypeName) : undefined,
    });
    const line = lines[index];
    void lookupAndApplyLinePrices(index, doctorId, workTypeId, line?.technicianId ?? "");
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function resolveTechnicianUnitPrice(line: WorkLineForm): Promise<number> {
    if (line.technicianUnitPrice.trim()) {
      return parseRonInput(line.technicianUnitPrice);
    }
    if (!doctorId || !line.workTypeId || !line.technicianId) {
      return 0;
    }
    try {
      const prices = await ratesApi.lookupLinePrices({
        doctorId,
        workTypeId: line.workTypeId,
        technicianId: line.technicianId,
      });
      return prices.technicianUnitPrice;
    } catch {
      return 0;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!doctorId) {
      setFormError("Selectează un doctor.");
      return;
    }
    if (!patientName.trim()) {
      setFormError("Numele pacientului este obligatoriu.");
      return;
    }
    const validLines = lines.filter((l) => l.workTypeId);
    if (validLines.length === 0) {
      setFormError("Adaugă cel puțin o linie de lucrare.");
      return;
    }

    const payload = {
      entryDate,
      patientName: patientName.trim(),
      observations: observations.trim() || undefined,
      paymentStatus,
      doctorId,
      lines: await Promise.all(
        validLines.map(async (line) => ({
          workTypeId: line.workTypeId,
          technicianId: line.technicianId || undefined,
          technician2Id: line.technician2Id || undefined,
          technician3Id: line.technician3Id || undefined,
          quantity: Math.max(1, parseInt(line.quantity, 10) || 1),
          doctorUnitPrice: parseRonInput(line.doctorUnitPrice),
          technicianUnitPrice: await resolveTechnicianUnitPrice(line),
        })),
      ),
    };

    try {
      if (isEditMode && workId) {
        await updateWork.mutateAsync({ id: workId, ...payload });
      } else {
        await createWork.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Eroare necunoscută.");
    }
  }

  const isSubmitting = createWork.isPending || updateWork.isPending;
  const isFormLoading = isEditMode && (isLoadingWork || isFetching) && !existingWork;

  function renderTechnicianSelect(
    index: number,
    field: "technicianId" | "technician2Id" | "technician3Id",
    nameField: "technicianName" | "technician2Name" | "technician3Name",
    label: string,
    onPrimaryChange?: (technicianId: string) => void,
  ) {
    const line = lines[index];
    if (!line) return null;

    return (
      <div className="flex flex-col gap-1">
        {index === 0 && <span className="text-xs text-muted-foreground">{label}</span>}
        <SearchableEntitySelect
          value={line[field]}
          valueLabel={line[nameField]}
          onChange={(next) => {
            applyLinePatch(index, {
              [field]: next,
              ...(next ? {} : { [nameField]: undefined }),
            });
            if (field === "technicianId" && onPrimaryChange) {
              onPrimaryChange(next);
            }
          }}
          onSelectOption={(option) => {
            applyLinePatch(index, {
              [field]: option?.id ?? "",
              [nameField]: option?.label,
            });
            if (field === "technicianId" && onPrimaryChange && option?.id) {
              onPrimaryChange(option.id);
            }
          }}
          queryKey="technicians-form"
          loadOptions={loadActiveTechnicianOptions}
          clearLabel="—"
          emptyLabel="—"
          searchPlaceholder="Caută tehnician..."
        />
      </div>
    );
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează lucrare" : "Lucrare nouă"}</DialogTitle>
          <DialogDescription>
            Pe fiecare linie poți selecta până la 3 tehnicieni. Prețul doctor se completează din
            grilă și poate fi modificat manual; prețul tehnician se ia automat din grile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Data intrării *</Label>
              <DatePicker value={entryDate} onChange={setEntryDate} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status plată</Label>
              <PaymentStatusSelect value={paymentStatus} onChange={(v) => v && setPaymentStatus(v)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Doctor / cabinet *</Label>
              <SearchableEntitySelect
                value={doctorId}
                valueLabel={doctorName}
                onChange={(next) => {
                  setDoctorId(next);
                  if (!next) setDoctorName(null);
                }}
                onSelectOption={(option) => {
                  const nextId = option?.id ?? "";
                  setDoctorId(nextId);
                  setDoctorName(option?.label ?? null);
                  if (nextId) {
                    void (async () => {
                      for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (line.workTypeId) {
                          await lookupAndApplyLinePrices(i, nextId, line.workTypeId, line.technicianId);
                        }
                      }
                    })();
                  }
                }}
                queryKey="doctors-form"
                loadOptions={loadDoctorOptions}
                emptyLabel="Selectează doctor"
                searchPlaceholder="Caută doctor..."
                disabled={isFormLoading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patientName">Pacient *</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observations">Observații</Label>
            <Textarea
              id="observations"
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Linii lucrări *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Linie nouă
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {lines.map((line, index) => (
                <div
                  key={line.key}
                  className="grid grid-cols-[minmax(120px,1.2fr)_minmax(88px,1fr)_minmax(88px,1fr)_minmax(88px,1fr)_52px_76px_36px] items-end gap-2 rounded-md border border-border bg-card/50 p-3"
                >
                  <div className="flex flex-col gap-1">
                    {index === 0 && <span className="text-xs text-muted-foreground">Tip lucrare</span>}
                    <SearchableEntitySelect
                      value={line.workTypeId}
                      valueLabel={line.workTypeName}
                      onChange={(workTypeId) => handleWorkTypeChange(index, workTypeId)}
                      onSelectOption={(option) => {
                        handleWorkTypeChange(index, option?.id ?? "", option?.label);
                      }}
                      queryKey="work-types-form"
                      loadOptions={loadWorkTypeOptions}
                      emptyLabel="Selectează"
                      searchPlaceholder="Caută tip..."
                    />
                  </div>
                  {renderTechnicianSelect(index, "technicianId", "technicianName", "Tehnician 1", (technicianId) => {
                    const current = lines[index];
                    if (current?.workTypeId) {
                      void lookupAndApplyLinePrices(index, doctorId, current.workTypeId, technicianId);
                    }
                  })}
                  {renderTechnicianSelect(index, "technician2Id", "technician2Name", "Tehnician 2")}
                  {renderTechnicianSelect(index, "technician3Id", "technician3Name", "Tehnician 3")}
                  <div className="flex flex-col gap-1">
                    {index === 0 && <span className="text-xs text-muted-foreground">Cant.</span>}
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => updateLine(index, { quantity: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    {index === 0 && <span className="text-xs text-muted-foreground">Preț doctor</span>}
                    <Input
                      placeholder="0.00"
                      value={line.doctorUnitPrice}
                      onChange={(e) => updateLine(index, { doctorUnitPrice: e.target.value })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 1}
                    aria-label="Șterge linia"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {isFormLoading && (
            <p className="text-sm text-muted-foreground">Se încarcă datele lucrării...</p>
          )}

          {formError && <p className="text-xs text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={isSubmitting || isFormLoading}>
              {isSubmitting ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
