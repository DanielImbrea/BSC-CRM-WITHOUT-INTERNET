import type {
  ClientDto,
  ClientListItem,
  CreateClientRequest,
  UpdateClientRequest,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const clientsApi = {
  async list(): Promise<ClientListItem[]> {
    return unwrapIpc(await window.labManager.clients.list());
  },
  async get(id: string): Promise<ClientDto> {
    return unwrapIpc(await window.labManager.clients.get({ id }));
  },
  async create(payload: CreateClientRequest): Promise<ClientDto> {
    return unwrapIpc(await window.labManager.clients.create(payload));
  },
  async update(payload: UpdateClientRequest): Promise<ClientDto> {
    return unwrapIpc(await window.labManager.clients.update(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.clients.delete({ id }));
  },
};
