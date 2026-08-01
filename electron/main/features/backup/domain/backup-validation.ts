import { ValidationError } from "../../../shared/errors";

/** Verificare minimă de bun-simț — fișierul trebuie să existe și să aibă extensia .db. */
export function assertLooksLikeDatabaseFile(filePath: string): void {
  if (!filePath.toLowerCase().endsWith(".db")) {
    throw new ValidationError("Fișierul selectat nu pare a fi o bază de date (.db).");
  }
}
