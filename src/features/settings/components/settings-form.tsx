import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { useAppSettings, useUpdateAppSettings } from "../hooks/use-settings";
import { settingsFormSchema, type SettingsFormValues } from "../types/settings-schema";

export function SettingsForm() {
  const { data: settings, isLoading } = useAppSettings();
  const updateSettings = useUpdateAppSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: { autoBackupEnabled: false, maxBackupsRetained: "10" },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        autoBackupEnabled: settings.autoBackupEnabled,
        maxBackupsRetained: String(settings.maxBackupsRetained),
      });
    }
  }, [settings, form]);

  async function onSubmit(values: SettingsFormValues) {
    await updateSettings.mutateAsync({
      autoBackupEnabled: values.autoBackupEnabled,
      maxBackupsRetained: Number(values.maxBackupsRetained),
    });
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Se încarcă...</p>;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-foreground">Backup automat</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              {...form.register("autoBackupEnabled")}
            />
            Creează automat un backup la fiecare închidere a aplicației
          </label>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maxBackupsRetained">Numărul maxim de backup-uri păstrate</Label>
            <Input id="maxBackupsRetained" className="w-24" inputMode="numeric" {...form.register("maxBackupsRetained")} />
            <p className="text-xs text-muted-foreground">
              Backup-urile mai vechi decât acest număr se șterg automat după fiecare backup nou.
            </p>
            {form.formState.errors.maxBackupsRetained && (
              <p className="text-xs text-destructive">{form.formState.errors.maxBackupsRetained.message}</p>
            )}
          </div>

          {updateSettings.isError && (
            <p className="text-xs text-destructive">
              {updateSettings.error instanceof Error ? updateSettings.error.message : "Eroare necunoscută."}
            </p>
          )}
          {updateSettings.isSuccess && (
            <p className="text-xs text-emerald-400">Setările au fost salvate.</p>
          )}

          <Button type="submit" disabled={updateSettings.isPending} className="self-start">
            {updateSettings.isPending ? "Se salvează..." : "Salvează"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
