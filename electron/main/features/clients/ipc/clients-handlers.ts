import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  ClientDto,
  ClientListItem,
  CreateClientRequest,
  UpdateClientRequest,
  DeleteClientRequest,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as clientUseCases from "../application/client-use-cases";
import type { ClientRecord } from "../infrastructure/clients-repository";

function toDto(record: ClientRecord): ClientDto {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    address: record.address,
    worksCount: record.worksCount,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toListItem(record: ClientRecord): ClientListItem {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    worksCount: record.worksCount,
  };
}

export function registerClientsHandlers(): void {
  registerIpcHandler<void, ClientListItem[]>(IPC_CHANNELS.CLIENTS_LIST, async () => {
    const clients = await clientUseCases.listClients();
    return clients.map(toListItem);
  });

  registerIpcHandler<{ id: string }, ClientDto>(IPC_CHANNELS.CLIENTS_GET, async (payload) => {
    const client = await clientUseCases.getClient(payload.id);
    return toDto(client);
  });

  registerIpcHandler<CreateClientRequest, ClientDto>(IPC_CHANNELS.CLIENTS_CREATE, async (payload) => {
    const client = await clientUseCases.createClient(payload);
    return toDto(client);
  });

  registerIpcHandler<UpdateClientRequest, ClientDto>(IPC_CHANNELS.CLIENTS_UPDATE, async (payload) => {
    const client = await clientUseCases.updateClient(payload.id, payload);
    return toDto(client);
  });

  registerIpcHandler<DeleteClientRequest, void>(IPC_CHANNELS.CLIENTS_DELETE, async (payload) => {
    await clientUseCases.deleteClient(payload.id);
  });
}
