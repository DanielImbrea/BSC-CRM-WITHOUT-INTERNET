/**
 * Erori de business, distincte de erorile tehnice neașteptate.
 * IPC handler-ele prind AppError și îl mapează 1:1 la un cod stabil
 * trimis către renderer; orice altă excepție e tratată ca eroare
 * neașteptată (logată complet, dar ascunsă utilizatorului final).
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super("NOT_FOUND", `${entity} cu id "${id}" nu a fost găsit.`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Autentificare necesară.") {
    super("UNAUTHORIZED", message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message);
  }
}
