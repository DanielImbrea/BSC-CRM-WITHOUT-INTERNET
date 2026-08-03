import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { doctorFormSchema, type DoctorFormValues } from "../types/doctor-schemas";
import { useDoctor } from "../hooks/use-doctors";
import { useCreateDoctor, useUpdateDoctor } from "../hooks/use-doctor-mutations";

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId?: string | null;
}

const emptyValues: DoctorFormValues = { name: "", phone: "", email: "", address: "" };

export function DoctorFormDialog({ open, onOpenChange, doctorId = null }: DoctorFormDialogProps) {
  const isEditMode = doctorId !== null;
  const { data: existingDoctor } = useDoctor(isEditMode ? doctorId : null);
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open && isEditMode && existingDoctor) {
      form.reset({
        name: existingDoctor.name,
        phone: existingDoctor.phone ?? "",
        email: existingDoctor.email ?? "",
        address: existingDoctor.address ?? "",
      });
    } else if (open && !isEditMode) {
      form.reset(emptyValues);
    }
  }, [open, isEditMode, existingDoctor, form]);

  async function onSubmit(values: DoctorFormValues) {
    const payload = {
      name: values.name,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
    };

    if (isEditMode && doctorId) {
      await updateDoctor.mutateAsync({ id: doctorId, ...payload });
    } else {
      await createDoctor.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const isSubmitting = createDoctor.isPending || updateDoctor.isPending;
  const mutationError = createDoctor.error ?? updateDoctor.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează doctor" : "Doctor nou"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualizează datele de contact ale doctorului."
              : "Adaugă un doctor nou în evidența laboratorului."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nume *</Label>
            <Input id="name" autoFocus {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Adresă</Label>
            <Input id="address" {...form.register("address")} />
          </div>

          {mutationError && (
            <p className="text-xs text-destructive">
              {mutationError instanceof Error ? mutationError.message : "Eroare necunoscută."}
            </p>
          )}

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
