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
import { clientFormSchema, type ClientFormValues } from "../types/client-schemas";
import { useClient } from "../hooks/use-clients";
import { useCreateClient, useUpdateClient } from "../hooks/use-client-mutations";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dacă e prezent, dialogul editează clientul respectiv; altfel creează unul nou. */
  clientId?: string | null;
}

const emptyValues: ClientFormValues = { name: "", phone: "", email: "", address: "" };

export function ClientFormDialog({ open, onOpenChange, clientId = null }: ClientFormDialogProps) {
  const isEditMode = clientId !== null;
  const { data: existingClient } = useClient(isEditMode ? clientId : null);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: emptyValues,
  });

  // Preîncarcă formularul cu datele existente când se deschide în modul editare.
  React.useEffect(() => {
    if (open && isEditMode && existingClient) {
      form.reset({
        name: existingClient.name,
        phone: existingClient.phone ?? "",
        email: existingClient.email ?? "",
        address: existingClient.address ?? "",
      });
    } else if (open && !isEditMode) {
      form.reset(emptyValues);
    }
  }, [open, isEditMode, existingClient, form]);

  async function onSubmit(values: ClientFormValues) {
    const payload = {
      name: values.name,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
    };

    if (isEditMode && clientId) {
      await updateClient.mutateAsync({ id: clientId, ...payload });
    } else {
      await createClient.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  const isSubmitting = createClient.isPending || updateClient.isPending;
  const mutationError = createClient.error ?? updateClient.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editează client" : "Client nou"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualizează datele de contact ale clientului."
              : "Adaugă un client nou în evidența laboratorului."}
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
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
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
