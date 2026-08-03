import { Prisma } from "../../../shared/prisma";
import { doctorsRepository, type DoctorRecord } from "../infrastructure/doctors-repository";
import { assertDoctorIsValid, type DoctorInput } from "../domain/doctor-validation";
import { NotFoundError, ConflictError } from "../../../shared/errors";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function listDoctors(): Promise<DoctorRecord[]> {
  requireAuthenticated();
  return doctorsRepository.findAll();
}

export async function getDoctor(id: string): Promise<DoctorRecord> {
  requireAuthenticated();
  const doctor = await doctorsRepository.findById(id);
  if (!doctor) throw new NotFoundError("Doctor", id);
  return doctor;
}

export async function createDoctor(input: DoctorInput): Promise<DoctorRecord> {
  requireAuthenticated();
  assertDoctorIsValid(input);
  return doctorsRepository.create(input);
}

export async function updateDoctor(id: string, input: DoctorInput): Promise<DoctorRecord> {
  requireAuthenticated();
  assertDoctorIsValid(input);
  if (!(await doctorsRepository.findById(id))) throw new NotFoundError("Doctor", id);
  return doctorsRepository.update(id, input);
}

export async function deleteDoctor(id: string): Promise<void> {
  requireAuthenticated();
  const existing = await doctorsRepository.findById(id);
  if (!existing) throw new NotFoundError("Doctor", id);
  try {
    await doctorsRepository.delete(id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2014")
    ) {
      throw new ConflictError(
        `Doctorul "${existing.name}" are lucrări asociate și nu poate fi șters.`,
      );
    }
    throw error;
  }
}
