import type {
  CreateDoctorRequest,
  DoctorDto,
  ListDoctorsRequest,
  ListDoctorsResponse,
  UpdateDoctorRequest,
} from "@shared-types/ipc";
import { unwrapIpc } from "@/shared/lib/ipc";

export const doctorsApi = {
  async list(params: ListDoctorsRequest = {}): Promise<ListDoctorsResponse> {
    return unwrapIpc(await window.labManager.doctors.list(params));
  },
  async get(id: string): Promise<DoctorDto> {
    return unwrapIpc(await window.labManager.doctors.get({ id }));
  },
  async create(payload: CreateDoctorRequest): Promise<DoctorDto> {
    return unwrapIpc(await window.labManager.doctors.create(payload));
  },
  async update(payload: UpdateDoctorRequest): Promise<DoctorDto> {
    return unwrapIpc(await window.labManager.doctors.update(payload));
  },
  async delete(id: string): Promise<void> {
    return unwrapIpc(await window.labManager.doctors.delete({ id }));
  },
};
