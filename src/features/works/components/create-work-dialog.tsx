import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { workFormSchema, type WorkFormValues } from "../types/work-schemas";
import { useCreateWork } from "../hooks/use-work-mutations";
import { useClients } from "@/features/clients/hooks/use-clients";
import { useMaterials } from "@/features/materials/hooks/use-materials";

interface CreateWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: WorkFormValues = { title: "", clientId: "", materials: [], costs: [] };

export function CreateWorkDialog({ open, onOpenChange }: CreateWorkDialogProps) {
  const { data: clients } = useClients();
  const { data: materials } = useMaterials();
  const createWork = useCreateWork();

  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workFormSchema),
    defaultValues: emptyValues,
  });

  const materialFields = useFieldArray({ control: form.control, name: "materials" });
  const costFields = useFieldArray({ control: form.control, name: "costs" });

  function handleOpenChange(next: boolean) {
    if (!next) form.reset(emptyValues);
    onOpenChange(next);
  }

  async function onSubmit(values: WorkFormValues) {
    await createWork.mutateAsync({
      title: values.title,
      clientId: values.clientId,
      materials: values.materials.map((m) => ({
        materialName: m.materialName.trim(),
        quantity: Number(m.quantity),
      })),
      // Sumele se introduc de utilizator în RON și se convertesc în bani (subunități) pentru backend.
      costs: values.costs.map((c) => ({
        description: c.description,
        amount: Math.round(Number(c.amount) * 100),
        category: c.category,
      })),
    });
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lucrare nouă</DialogTitle>
          <DialogDescription>
            Adaugă lucrarea împreună cu materialele consumate și costurile asociate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Titlu lucrare *</Label>
              <Input id="title" autoFocus {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clientId">Client *</Label>
              <Select
                value={form.watch("clientId")}
                onValueChange={(value) => form.setValue("clientId", value, { shouldValidate: true })}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Alege un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clientId && (
                <p className="text-xs text-destructive">{form.formState.errors.clientId.message}</p>
              )}
              {clients?.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nu există încă niciun client — adaugă unul din secțiunea Clienți.
                </p>
              )}
            </div>
          </div>

          {/* Materiale consumate */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Materiale consumate</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => materialFields.append({ materialName: "", quantity: "" })}
              >
                <Plus className="h-3.5 w-3.5" />
                Adaugă material
              </Button>
            </div>

            {materialFields.fields.length === 0 && (
              <p className="text-xs text-muted-foreground">Nicio linie de material adăugată.</p>
            )}

            {materialFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Material"
                    list={`work-materials-${index}`}
                    {...form.register(`materials.${index}.materialName`)}
                  />
                  <datalist id={`work-materials-${index}`}>
                    {materials?.map((material) => (
                      <option key={material.id} value={material.name} />
                    ))}
                  </datalist>
                  {form.formState.errors.materials?.[index]?.materialName && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.materials[index]?.materialName?.message}
                    </p>
                  )}
                </div>
                <div className="w-28">
                  <Input
                    placeholder="Cantitate"
                    inputMode="decimal"
                    {...form.register(`materials.${index}.quantity`)}
                  />
                  {form.formState.errors.materials?.[index]?.quantity && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.materials[index]?.quantity?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => materialFields.remove(index)}
                  aria-label="Șterge linia"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Costuri */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Costuri</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => costFields.append({ description: "", amount: "", category: "" })}
              >
                <Plus className="h-3.5 w-3.5" />
                Adaugă cost
              </Button>
            </div>

            {costFields.fields.length === 0 && (
              <p className="text-xs text-muted-foreground">Nicio linie de cost adăugată.</p>
            )}

            {costFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input placeholder="Descriere" {...form.register(`costs.${index}.description`)} />
                  {form.formState.errors.costs?.[index]?.description && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.costs[index]?.description?.message}
                    </p>
                  )}
                </div>
                <div className="w-32">
                  <Input placeholder="Categorie" {...form.register(`costs.${index}.category`)} />
                  {form.formState.errors.costs?.[index]?.category && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.costs[index]?.category?.message}
                    </p>
                  )}
                </div>
                <div className="w-28">
                  <Input
                    placeholder="Sumă (RON)"
                    inputMode="decimal"
                    {...form.register(`costs.${index}.amount`)}
                  />
                  {form.formState.errors.costs?.[index]?.amount && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.costs[index]?.amount?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => costFields.remove(index)}
                  aria-label="Șterge linia"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {createWork.error && (
            <p className="text-xs text-destructive">
              {createWork.error instanceof Error ? createWork.error.message : "Eroare necunoscută."}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={createWork.isPending}>
              {createWork.isPending ? "Se salvează..." : "Salvează lucrarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
