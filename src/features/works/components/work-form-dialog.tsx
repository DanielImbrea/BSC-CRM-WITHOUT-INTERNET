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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { parseRonInput } from "@/shared/lib/format";
import { useDoctors } from "@/features/doctors/hooks/use-doctors";
import { useTechnicians } from "@/features/technicians/hooks/use-technicians";
import { useWorkTypes } from "@/features/work-types/hooks/use-work-types";
import { ratesApi } from "@/features/rates/api/rates-api";
import { useWork } from "../hooks/use-works";
import { useCreateWork, useUpdateWork } from "../hooks/use-work-mutations";
import { PaymentStatusSelect } from "./payment-status-select";
import type { PaymentStatus } from "@shared-types/ipc";

const NONE = "__none__";

interface WorkLineForm {
  key: string;
  workTypeId: string;
  technicianId: string;
  quantity: string;
  doctorUnitPrice: string;
  technicianUnitPrice: string;
}

interface WorkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId?: string | null;
}

function baniToInput(bani: number): string {
  return (bani / 100).toFixed(2);
}

function emptyLine(): WorkLineForm {
  return {
    key: crypto.randomUUID(),
    workTypeId: "",
    technicianId: "",
    quantity: "1",
    doctorUnitPrice: "",
    technicianUnitPrice: "",
  };
}

export function WorkFormDialog({ open, onOpenChange, workId = null }: WorkFormDialogProps) {
  const isEditMode = workId !== null;
  const { data: existingWork } = useWork(isEditMode ? workId : null);
  const { data: doctors = [] } = useDoctors();
  const { data: technicians = [] } = useTechnicians();
  const { data: workTypes = [] } = useWorkTypes();
  const createWork = useCreateWork();
  const updateWork = useUpdateWork();

  const [entryDate, setEntryDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [doctorId, setDoctorId] = React.useState("");
  const [patientName, setPatientName] = React.useState("");
  const [observations, setObservations] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>("NEPLATITA");
  const [lines, setLines] = React.useState<WorkLineForm[]>([emptyLine()]);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && isEditMode && existingWork) {
      setEntryDate(existingWork.entryDate.slice(0, 10));
      setDoctorId(existingWork.doctorId);
      setPatientName(existingWork.patientName);
      setObservations(existingWork.observations ?? "");
      setPaymentStatus(existingWork.paymentStatus);
      setLines(
        existingWork.lines.length > 0
          ? existingWork.lines.map((line) => ({
              key: line.id,
              workTypeId: line.workTypeId,
              technicianId: line.technicianId ?? "",
              quantity: String(line.quantity),
              doctorUnitPrice: baniToInput(line.doctorUnitPrice),
              technicianUnitPrice: baniToInput(line.technicianUnitPrice),
            }))
          : [emptyLine()],
      );
    } else if (open && !isEditMode) {
      setEntryDate(format(new Date(), "yyyy-MM-dd"));
      setDoctorId("");
      setPatientName("");
      setObservations("");
      setPaymentStatus("NEPLATITA");
      setLines([emptyLine()]);
    }
    setFormError(null);
  }, [open, isEditMode, existingWork]);

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

  function handleWorkTypeChange(index: number, workTypeId: string) {
    updateLine(index, { workTypeId });
    const line = lines[index];
    void lookupAndApplyLinePrices(index, doctorId, workTypeId, line?.technicianId ?? "");
  }

  function handleTechnicianChange(index: number, technicianId: string) {
    updateLine(index, { technicianId });
    const line = lines[index];
    if (line?.workTypeId) {
      void lookupAndApplyLinePrices(index, doctorId, line.workTypeId, technicianId);
    }
  }

  async function handleDoctorChange(nextDoctorId: string) {
    setDoctorId(nextDoctorId);
    if (!nextDoctorId) return;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.workTypeId) {
        await lookupAndApplyLinePrices(i, nextDoctorId, line.workTypeId, line.technicianId);
      }
    }
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
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
      lines: validLines.map((line) => ({
        workTypeId: line.workTypeId,
        technicianId: line.technicianId || undefined,
        quantity: Math.max(1, parseInt(line.quantity, 10) || 1),
        doctorUnitPrice: parseRonInput(line.doctorUnitPrice),
        technicianUnitPrice: parseRonInput(line.technicianUnitPrice),
      })),
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
  const activeTechnicians = technicians.filter((t) => t.active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează lucrare" : "Lucrare nouă"}</DialogTitle>
          <DialogDescription>
            Fiecare linie poate avea propriul tehnician (metal, ceramică, etc.). Prețurile se
            completează din grilele configurate la Doctori / Tehnicieni.
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
              <Select value={doctorId} onValueChange={(v) => void handleDoctorChange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  className="grid grid-cols-[1fr_1fr_64px_88px_88px_36px] items-end gap-2 rounded-md border border-border bg-card/50 p-3"
                >
                  <div className="flex flex-col gap-1">
                    {index === 0 && <span className="text-xs text-muted-foreground">Tip lucrare</span>}
                    <Select
                      value={line.workTypeId || undefined}
                      onValueChange={(v) => handleWorkTypeChange(index, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează" />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map((wt) => (
                          <SelectItem key={wt.id} value={wt.id}>
                            {wt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    {index === 0 && <span className="text-xs text-muted-foreground">Tehnician</span>}
                    <Select
                      value={line.technicianId || NONE}
                      onValueChange={(v) => handleTechnicianChange(index, v === NONE ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>—</SelectItem>
                        {activeTechnicians.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <div className="flex flex-col gap-1">
                    {index === 0 && (
                      <span className="text-xs text-muted-foreground">Preț tehnician</span>
                    )}
                    <Input
                      placeholder="0.00"
                      value={line.technicianUnitPrice}
                      onChange={(e) => updateLine(index, { technicianUnitPrice: e.target.value })}
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

          {formError && <p className="text-xs text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
