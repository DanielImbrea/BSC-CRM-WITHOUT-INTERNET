import { SettingsForm } from "../components/settings-form";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Setări</h1>
        <p className="text-sm text-muted-foreground">Configurări generale ale aplicației.</p>
      </div>

      <SettingsForm />
    </div>
  );
}
