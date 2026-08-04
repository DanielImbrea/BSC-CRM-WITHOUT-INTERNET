import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  DoctorDto,
  DoctorListItem,
  ListDoctorsRequest,
  ListDoctorsResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DeleteDoctorRequest,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as doctorUseCases from "../application/doctor-use-cases";
import type { DoctorRecord } from "../infrastructure/doctors-repository";

function toDto(record: DoctorRecord): DoctorDto {
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

function toListItem(record: DoctorRecord): DoctorListItem {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone,
    email: record.email,
    worksCount: record.worksCount,
  };
}

export function registerDoctorsHandlers(): void {
  registerIpcHandler<ListDoctorsRequest | void, ListDoctorsResponse>(
    IPC_CHANNELS.DOCTORS_LIST,
    async (payload) => {
      const result = await doctorUseCases.listDoctors(payload ?? {});
      return {
        items: result.items.map(toListItem),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };
    },
  );

  registerIpcHandler<{ id: string }, DoctorDto>(IPC_CHANNELS.DOCTORS_GET, async (payload) => {
    return toDto(await doctorUseCases.getDoctor(payload.id));
  });

  registerIpcHandler<CreateDoctorRequest, DoctorDto>(IPC_CHANNELS.DOCTORS_CREATE, async (payload) => {
    return toDto(await doctorUseCases.createDoctor(payload));
  });

  registerIpcHandler<UpdateDoctorRequest, DoctorDto>(IPC_CHANNELS.DOCTORS_UPDATE, async (payload) => {
    return toDto(await doctorUseCases.updateDoctor(payload.id, payload));
  });

  registerIpcHandler<DeleteDoctorRequest, void>(IPC_CHANNELS.DOCTORS_DELETE, async (payload) => {
    await doctorUseCases.deleteDoctor(payload.id);
  });
}
