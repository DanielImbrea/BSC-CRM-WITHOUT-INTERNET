import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  WorkDto,
  WorkListItem,
  ListWorksRequest,
  ListWorksResponse,
  SearchWorksResponse,
  CreateWorkRequest,
  UpdateWorkRequest,
  UpdateWorkPaymentStatusRequest,
  DeleteWorkRequest,
  SearchWorksFilters,
  WorkLineDto,
} from "@shared-types/ipc";
import { registerIpcHandler } from "../../../shared/ipc-handler";
import * as workUseCases from "../application/work-use-cases";
import {
  computeDoctorTotal,
  computeTechnicianTotal,
  type WorkDetailRecord,
  type WorkListRecord,
} from "../infrastructure/works-repository";

function toLineDto(line: WorkDetailRecord["lines"][number]): WorkLineDto {
  return {
    id: line.id,
    workTypeId: line.workTypeId,
    workTypeName: line.workTypeName,
    technicianId: line.technicianId,
    technicianName: line.technicianName,
    technician2Id: line.technician2Id,
    technician2Name: line.technician2Name,
    technician3Id: line.technician3Id,
    technician3Name: line.technician3Name,
    quantity: line.quantity,
    doctorUnitPrice: line.doctorUnitPrice,
    technicianUnitPrice: line.technicianUnitPrice,
    doctorLineTotal: line.quantity * line.doctorUnitPrice,
    technicianLineTotal: line.quantity * line.technicianUnitPrice,
  };
}

function toListItem(record: WorkListRecord): WorkListItem {
  return {
    id: record.id,
    entryDate: record.entryDate.toISOString(),
    patientName: record.patientName,
    doctorId: record.doctorId,
    doctorName: record.doctorName,
    observations: record.observations,
    paymentStatus: record.paymentStatus,
    doctorTotal: record.doctorTotal,
    technicianTotal: record.technicianTotal,
    workSummary: record.workSummary,
    technician1Id: record.technician1Id,
    technician1Name: record.technician1Name,
    technician2Id: record.technician2Id,
    technician2Name: record.technician2Name,
    technician3Id: record.technician3Id,
    technician3Name: record.technician3Name,
  };
}

function toDto(record: WorkDetailRecord): WorkDto {
  const lines = record.lines.map(toLineDto);
  return {
    id: record.id,
    entryDate: record.entryDate.toISOString(),
    patientName: record.patientName,
    observations: record.observations,
    paymentStatus: record.paymentStatus,
    doctorId: record.doctorId,
    doctorName: record.doctorName,
    technician1Id: record.technician1Id,
    technician1Name: record.technician1Name,
    technician2Id: record.technician2Id,
    technician2Name: record.technician2Name,
    technician3Id: record.technician3Id,
    technician3Name: record.technician3Name,
    lines,
    doctorTotal: computeDoctorTotal(lines),
    technicianTotal: computeTechnicianTotal(lines),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function registerWorksHandlers(): void {
  registerIpcHandler<ListWorksRequest | void, ListWorksResponse>(IPC_CHANNELS.WORKS_LIST, async (payload) => {
    const result = await workUseCases.listWorks(payload ?? {});
    return {
      items: result.items.map(toListItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  });

  registerIpcHandler<SearchWorksFilters, SearchWorksResponse>(IPC_CHANNELS.WORKS_SEARCH, async (payload) => {
    const result = await workUseCases.searchWorks(payload);
    return {
      items: result.items.map(toListItem),
      total: result.total,
      truncated: result.truncated,
    };
  });

  registerIpcHandler<{ id: string }, WorkDto>(IPC_CHANNELS.WORKS_GET, async (payload) => {
    return toDto(await workUseCases.getWork(payload.id));
  });

  registerIpcHandler<CreateWorkRequest, WorkDto>(IPC_CHANNELS.WORKS_CREATE, async (payload) => {
    return toDto(await workUseCases.createWork(payload));
  });

  registerIpcHandler<UpdateWorkRequest, WorkDto>(IPC_CHANNELS.WORKS_UPDATE, async (payload) => {
    return toDto(await workUseCases.updateWork(payload.id, payload));
  });

  registerIpcHandler<UpdateWorkPaymentStatusRequest, WorkDto>(
    IPC_CHANNELS.WORKS_UPDATE_PAYMENT_STATUS,
    async (payload) => toDto(await workUseCases.updateWorkPaymentStatus(payload.id, payload.paymentStatus)),
  );

  registerIpcHandler<DeleteWorkRequest, void>(IPC_CHANNELS.WORKS_DELETE, async (payload) => {
    await workUseCases.deleteWork(payload.id);
  });
}
