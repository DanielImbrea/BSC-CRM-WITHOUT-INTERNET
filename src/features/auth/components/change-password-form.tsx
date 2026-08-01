import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "../api/auth-api";
import { changePasswordSchema, type ChangePasswordFormValues } from "../types/change-password-schema";

export function ChangePasswordForm() {
  const queryClient = useQueryClient();
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ["auth", "security-info"] });
    },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Parola curentă</Label>
        <Input id="currentPassword" type="password" {...form.register("currentPassword")} />
        {form.formState.errors.currentPassword && (
          <p className="text-xs text-destructive">{form.formState.errors.currentPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">Parolă nouă</Label>
        <Input id="newPassword" type="password" {...form.register("newPassword")} />
        {form.formState.errors.newPassword && (
          <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmNewPassword">Confirmă parola nouă</Label>
        <Input id="confirmNewPassword" type="password" {...form.register("confirmNewPassword")} />
        {form.formState.errors.confirmNewPassword && (
          <p className="text-xs text-destructive">{form.formState.errors.confirmNewPassword.message}</p>
        )}
      </div>

      {changePassword.isError && (
        <p className="text-xs text-destructive">
          {changePassword.error instanceof Error ? changePassword.error.message : "Eroare necunoscută."}
        </p>
      )}
      {changePassword.isSuccess && (
        <p className="text-xs text-emerald-400">Parola a fost schimbată cu succes.</p>
      )}

      <Button type="submit" disabled={changePassword.isPending} className="self-start">
        {changePassword.isPending ? "Se salvează..." : "Schimbă parola"}
      </Button>
    </form>
  );
}
