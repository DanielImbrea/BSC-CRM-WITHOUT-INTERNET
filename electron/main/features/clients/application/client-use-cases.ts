import { Prisma } from "@prisma/client";
import { clientsRepository, type ClientRecord } from "../infrastructure/clients-repository";
import { assertClientIsValid, type ClientInput } from "../domain/client-validation";
import { NotFoundError, ConflictError } from "../../../shared/errors";
import { recordAuditEvent } from "../../audit-log/application/record-audit-event";
import { AUDIT_ACTIONS } from "../../audit-log/domain/audit-action";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listClients(): Promise<ClientRecord[]> {
  requireAuthenticated();
  return clientsRepository.findAll();
}

export async function getClient(id: string): Promise<ClientRecord> {
  requireAuthenticated();
  const client = await clientsRepository.findById(id);
  if (!client) {
    throw new NotFoundError("Client", id);
  }
  return client;
}

export async function createClient(input: ClientInput): Promise<ClientRecord> {
  requireAuthenticated();
  assertClientIsValid(input);
  return clientsRepository.create(input);
}

export async function updateClient(id: string, input: ClientInput): Promise<ClientRecord> {
  requireAuthenticated();
  assertClientIsValid(input);
  const existing = await clientsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Client", id);
  }
  return clientsRepository.update(id, input);
}

export async function deleteClient(id: string): Promise<void> {
  requireAuthenticated();
  const existing = await clientsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Client", id);
  }

  try {
    await clientsRepository.delete(id);
  } catch (error) {
    // Constrângere de foreign key (Work.clientId -> Restrict): clientul are lucrări asociate.
    // SQLite/Prisma pot semnala asta fie ca P2003, fie ca P2014, în funcție de versiune.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2014")
    ) {
      throw new ConflictError(
        `Clientul "${existing.name}" are lucrări asociate și nu poate fi șters. Șterge sau reasignează lucrările mai întâi.`,
      );
    }
    throw error;
  }

  await recordAuditEvent({
    action: AUDIT_ACTIONS.DELETE,
    entityType: "Client",
    entityId: id,
    before: existing,
  });
}
