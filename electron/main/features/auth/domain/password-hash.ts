import bcrypt from "bcryptjs";
import { ValidationError } from "../../../shared/errors";

const BCRYPT_ROUNDS = 12;

/** Hash-urile bcrypt încep cu $2a$, $2b$ sau $2y$. */
function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$/.test(hash);
}

/** Versiunile vechi foloseau argon2 — bcrypt nu le poate verifica. */
function isLegacyArgon2Hash(hash: string): boolean {
  return hash.startsWith("$argon2");
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (isLegacyArgon2Hash(storedHash)) {
    throw new ValidationError(
      "Parola a fost setată cu o versiune veche a aplicației. Folosește „Resetează parola” de pe ecranul de login.",
    );
  }

  if (!isBcryptHash(storedHash)) {
    throw new ValidationError(
      "Parola din baza de date nu este validă. Folosește „Resetează parola” de pe ecranul de login.",
    );
  }

  return bcrypt.compareSync(password, storedHash);
}
