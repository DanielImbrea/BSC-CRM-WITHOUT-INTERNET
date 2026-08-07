import * as React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { SearchableEntitySelect } from "@/shared/components/searchable-entity-select";
import { loadActiveTechnicianOptions } from "@/shared/lib/catalog-options";
import { formatDate, PAYMENT_STATUS_LABELS } from "@/shared/lib/format";
import { paymentStatusBadgeVariant, PaymentStatusSelect } from "./payment-status-select";
import {
  draftFromWorkListItem,
  saveWorkTechniciansFromListItem,
  type TechnicianDraft,
} from "../lib/save-work-technicians";
import type { PaymentStatus, WorkListItem } from "@shared-types/ipc";

interface WorksTableProps {
  works: WorkListItem[];
  onEdit?: (work: WorkListItem) => void;
  onDelete?: (work: WorkListItem) => void;
  onPaymentStatusChange?: (work: WorkListItem, status: PaymentStatus) => void;
  inlineTechnicianEdit?: boolean;
  onWorkUpdated?: (work: WorkListItem) => void;
  showActions?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

function cellText(value: string | null | undefined): string {
  return value?.trim() || "—";
}

function formatObservations(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const cleaned = value.replace(/\s*\[stomdental:\d+\]\s*/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || "—";
}

function draftsEqual(a: TechnicianDraft, b: TechnicianDraft): boolean {
  return (
    a.technician1Id === b.technician1Id &&
    a.technician2Id === b.technician2Id &&
    a.technician3Id === b.technician3Id
  );
}

function technicianSelect(
  work: WorkListItem,
  draft: TechnicianDraft,
  field: keyof Pick<TechnicianDraft, "technician1Id" | "technician2Id" | "technician3Id">,
  nameField: keyof Pick<TechnicianDraft, "technician1Name" | "technician2Name" | "technician3Name">,
  applyDraftPatch: (work: WorkListItem, patch: Partial<TechnicianDraft>) => void,
) {
  return (
    <SearchableEntitySelect
      key={`${work.id}-${field}`}
      value={draft[field]}
      valueLabel={draft[nameField]}
      onChange={(next) => {
        applyDraftPatch(work, {
          [field]: next,
          [nameField]: next ? draft[nameField] : null,
        });
      }}
      onSelectOption={(option) => {
        applyDraftPatch(work, {
          [field]: option?.id ?? "",
          [nameField]: option?.label ?? null,
        });
      }}
      queryKey="technicians-inline-table"
      loadOptions={loadActiveTechnicianOptions}
      clearLabel="—"
      emptyLabel="—"
      searchPlaceholder="Caută tehnician..."
      className="min-w-[120px] max-w-[140px]"
    />
  );
}

export function WorksTable({
  works,
  onEdit,
  onDelete,
  onPaymentStatusChange,
  inlineTechnicianEdit = false,
  onWorkUpdated,
  showActions = true,
  emptyTitle = "Nicio lucrare încă",
  emptyDescription = "Adaugă prima lucrare cu butonul de mai sus.",
}: WorksTableProps) {
  const [drafts, setDrafts] = React.useState<Record<string, TechnicianDraft>>({});
  const [savingRowId, setSavingRowId] = React.useState<string | null>(null);
  const [savedRowId, setSavedRowId] = React.useState<string | null>(null);
  const [rowError, setRowError] = React.useState<string | null>(null);
  const savedTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  function showSaveSuccess(workId: string) {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    setSavedRowId(workId);
    savedTimeoutRef.current = setTimeout(() => setSavedRowId(null), 2500);
  }

  React.useEffect(() => {
    if (!inlineTechnicianEdit) return;
    setDrafts((current) => {
      const next = { ...current };
      for (const work of works) {
        if (!next[work.id]) {
          next[work.id] = draftFromWorkListItem(work);
        }
      }
      return next;
    });
  }, [works, inlineTechnicianEdit]);

  function applyDraftPatch(work: WorkListItem, patch: Partial<TechnicianDraft>) {
    setDrafts((current) => {
      const base = current[work.id] ?? draftFromWorkListItem(work);
      return { ...current, [work.id]: { ...base, ...patch } };
    });
    setRowError(null);
  }

  function getDraft(work: WorkListItem): TechnicianDraft {
    return drafts[work.id] ?? draftFromWorkListItem(work);
  }

  function isDirty(work: WorkListItem): boolean {
    const draft = getDraft(work);
    return !draftsEqual(draft, draftFromWorkListItem(work));
  }

  async function saveInlineEdit(work: WorkListItem) {
    const draft = getDraft(work);
    setSavingRowId(work.id);
    setRowError(null);
    try {
      const updated = await saveWorkTechniciansFromListItem(work, draft);
      setDrafts((current) => ({ ...current, [work.id]: draftFromWorkListItem(updated) }));
      onWorkUpdated?.(updated);
      showSaveSuccess(work.id);
    } catch (error) {
      setRowError(error instanceof Error ? error.message : "Nu am putut salva modificările.");
    } finally {
      setSavingRowId(null);
    }
  }

  if (works.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rowError && <p className="text-sm text-destructive">{rowError}</p>}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
              <th className="px-3 py-3 font-medium whitespace-nowrap">Data</th>
              <th className="px-3 py-3 font-medium">Pacient</th>
              <th className="px-3 py-3 font-medium">Doctor</th>
              <th className="px-3 py-3 font-medium">Lucrare</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">Tehnician 1</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">Tehnician 2</th>
              <th className="px-3 py-3 font-medium whitespace-nowrap">Tehnician 3</th>
              <th className="px-3 py-3 font-medium">Observații</th>
              <th className="px-3 py-3 font-medium">Status</th>
              {showActions && <th className="px-3 py-3 font-medium text-right">Acțiuni</th>}
            </tr>
          </thead>
          <tbody>
            {works.map((work) => {
              const draft = getDraft(work);
              const dirty = inlineTechnicianEdit && isDirty(work);

              return (
                <tr key={work.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                  <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(work.entryDate)}
                  </td>
                  <td className="px-3 py-3 font-medium text-foreground">{work.patientName}</td>
                  <td className="px-3 py-3 text-muted-foreground">{work.doctorName}</td>
                  <td
                    className="px-3 py-3 text-muted-foreground max-w-[160px] truncate"
                    title={work.workSummary}
                  >
                    {work.workSummary}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {inlineTechnicianEdit
                      ? technicianSelect(work, draft, "technician1Id", "technician1Name", applyDraftPatch)
                      : cellText(work.technician1Name)}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {inlineTechnicianEdit
                      ? technicianSelect(work, draft, "technician2Id", "technician2Name", applyDraftPatch)
                      : cellText(work.technician2Name)}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {inlineTechnicianEdit
                      ? technicianSelect(work, draft, "technician3Id", "technician3Name", applyDraftPatch)
                      : cellText(work.technician3Name)}
                  </td>
                  <td
                    className="px-3 py-3 text-muted-foreground max-w-[180px] truncate"
                    title={formatObservations(work.observations)}
                  >
                    {formatObservations(work.observations)}
                  </td>
                  <td className="px-3 py-3">
                    {onPaymentStatusChange ? (
                      <PaymentStatusSelect
                        compact
                        value={work.paymentStatus}
                        onChange={(status) => status && onPaymentStatusChange(work, status)}
                        placeholder={PAYMENT_STATUS_LABELS[work.paymentStatus]}
                      />
                    ) : (
                      <Badge variant={paymentStatusBadgeVariant(work.paymentStatus)}>
                        {PAYMENT_STATUS_LABELS[work.paymentStatus]}
                      </Badge>
                    )}
                  </td>
                  {showActions && (
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {savedRowId === work.id && (
                          <span
                            className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500"
                            title="Salvat cu succes!"
                          >
                            Salvat cu succes
                          </span>
                        )}
                        {inlineTechnicianEdit && dirty && savedRowId !== work.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={savingRowId === work.id}
                            onClick={() => void saveInlineEdit(work)}
                            aria-label="Salvează"
                            title="Salvează tehnicienii"
                          >
                            <Check className="h-4 w-4 text-emerald-500" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(work)}
                            aria-label="Editează lucrarea"
                            title="Editează toată lucrarea"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete?.(work)}
                          aria-label="Șterge"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
