/**
 * Contract IPC — Billionaire Smile Club CRM (laborator dentar).
 */

export type IpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface AuthLoginRequest {
  password: string;
}

export interface AuthLoginResponse {
  success: boolean;
}

export interface AuthIsConfiguredResponse {
  configured: boolean;
}

export interface AuthSetPasswordRequest {
  password: string;
}

export interface AuthChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthSecurityInfoResponse {
  passwordUpdatedAt: string;
}

// ---------------------------------------------------------------------------
// Doctori
// ---------------------------------------------------------------------------
export interface DoctorDto {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  worksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  worksCount: number;
}

export interface CreateDoctorRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateDoctorRequest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface DeleteDoctorRequest {
  id: string;
}

// ---------------------------------------------------------------------------
// Tehnicieni
// ---------------------------------------------------------------------------
export interface TechnicianDto {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnicianRequest {
  name: string;
  active?: boolean;
}

export interface UpdateTechnicianRequest {
  id: string;
  name: string;
  active: boolean;
}

export interface DeleteTechnicianRequest {
  id: string;
}

// ---------------------------------------------------------------------------
// Tipuri lucrări
// ---------------------------------------------------------------------------
export interface WorkTypeDto {
  id: string;
  name: string;
  doctorPrice: number;
  technicianPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkTypeRequest {
  name: string;
  doctorPrice: number;
  technicianPrice: number;
}

export interface UpdateWorkTypeRequest {
  id: string;
  name: string;
  doctorPrice: number;
  technicianPrice: number;
}

export interface DeleteWorkTypeRequest {
  id: string;
}

// ---------------------------------------------------------------------------
// Lucrări
// ---------------------------------------------------------------------------
export type PaymentStatus = "NEPLATITA" | "PLATITA_DOCTOR" | "PLATITA_TEHNICIAN";

export interface WorkLineDto {
  id: string;
  workTypeId: string;
  workTypeName: string;
  quantity: number;
  doctorUnitPrice: number;
  technicianUnitPrice: number;
  doctorLineTotal: number;
  technicianLineTotal: number;
}

export interface WorkListItem {
  id: string;
  entryDate: string;
  patientName: string;
  doctorName: string;
  paymentStatus: PaymentStatus;
  doctorTotal: number;
  technicianTotal: number;
  workSummary: string;
  technician1Name: string | null;
  technician2Name: string | null;
  technician3Name: string | null;
}

export interface WorkDto {
  id: string;
  entryDate: string;
  patientName: string;
  observations: string | null;
  paymentStatus: PaymentStatus;
  doctorId: string;
  doctorName: string;
  technician1Id: string | null;
  technician1Name: string | null;
  technician2Id: string | null;
  technician2Name: string | null;
  technician3Id: string | null;
  technician3Name: string | null;
  lines: WorkLineDto[];
  doctorTotal: number;
  technicianTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkLineInput {
  workTypeId: string;
  quantity: number;
  doctorUnitPrice: number;
  technicianUnitPrice: number;
}

export interface CreateWorkRequest {
  entryDate: string;
  patientName: string;
  observations?: string;
  paymentStatus?: PaymentStatus;
  doctorId: string;
  technician1Id?: string;
  technician2Id?: string;
  technician3Id?: string;
  lines: CreateWorkLineInput[];
}

export interface UpdateWorkRequest {
  id: string;
  entryDate: string;
  patientName: string;
  observations?: string;
  paymentStatus: PaymentStatus;
  doctorId: string;
  technician1Id?: string;
  technician2Id?: string;
  technician3Id?: string;
  lines: CreateWorkLineInput[];
}

export interface UpdateWorkPaymentStatusRequest {
  id: string;
  paymentStatus: PaymentStatus;
}

export interface DeleteWorkRequest {
  id: string;
}

export interface SearchWorksFilters {
  doctorId?: string;
  patientName?: string;
  technician1Id?: string;
  technician2Id?: string;
  technician3Id?: string;
  paymentStatus?: PaymentStatus;
  month?: string;
}

// ---------------------------------------------------------------------------
// Rapoarte
// ---------------------------------------------------------------------------
export interface MonthReportRequest {
  month: string;
  doctorId?: string;
  technicianId?: string;
}

export interface DoctorUnpaidReportLine {
  workId: string;
  entryDate: string;
  patientName: string;
  workSummary: string;
  amount: number;
}

export interface DoctorUnpaidReport {
  doctorName: string;
  month: string;
  lines: DoctorUnpaidReportLine[];
  totalAmount: number;
}

export interface TechnicianSalaryReportLine {
  workId: string;
  entryDate: string;
  patientName: string;
  doctorName: string;
  workSummary: string;
  amount: number;
}

export interface TechnicianSalaryReport {
  technicianName: string;
  month: string;
  lines: TechnicianSalaryReportLine[];
  totalAmount: number;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export interface DashboardSummary {
  worksThisMonth: number;
  unpaidWorks: number;
  doctorsCount: number;
  techniciansCount: number;
}

// ---------------------------------------------------------------------------
// Backup & Setări
// ---------------------------------------------------------------------------
export interface BackupRecordDto {
  id: string;
  filePath: string;
  sizeBytes: number;
  type: string;
  createdAt: string;
}

export interface RestoreBackupRequest {
  id: string;
}

export interface DeleteBackupRequest {
  id: string;
}

export interface ExportBackupRequest {
  id: string;
}

export interface ExportBackupResponse {
  savedPath: string;
}

export interface ImportAndRestoreResponse {
  restoredFrom: string;
}

export interface AppSettingsDto {
  autoBackupEnabled: boolean;
  maxBackupsRetained: number;
}

// ---------------------------------------------------------------------------
// Canale IPC
// ---------------------------------------------------------------------------
export const IPC_CHANNELS = {
  AUTH_IS_CONFIGURED: "auth:is-configured",
  AUTH_SET_PASSWORD: "auth:set-password",
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_CHANGE_PASSWORD: "auth:change-password",
  AUTH_GET_SECURITY_INFO: "auth:get-security-info",
  AUTH_RESET_PASSWORD: "auth:reset-password",
  DASHBOARD_GET_SUMMARY: "dashboard:get-summary",
  DOCTORS_LIST: "doctors:list",
  DOCTORS_GET: "doctors:get",
  DOCTORS_CREATE: "doctors:create",
  DOCTORS_UPDATE: "doctors:update",
  DOCTORS_DELETE: "doctors:delete",
  TECHNICIANS_LIST: "technicians:list",
  TECHNICIANS_CREATE: "technicians:create",
  TECHNICIANS_UPDATE: "technicians:update",
  TECHNICIANS_DELETE: "technicians:delete",
  WORK_TYPES_LIST: "work-types:list",
  WORK_TYPES_CREATE: "work-types:create",
  WORK_TYPES_UPDATE: "work-types:update",
  WORK_TYPES_DELETE: "work-types:delete",
  WORKS_LIST: "works:list",
  WORKS_SEARCH: "works:search",
  WORKS_GET: "works:get",
  WORKS_CREATE: "works:create",
  WORKS_UPDATE: "works:update",
  WORKS_UPDATE_PAYMENT_STATUS: "works:update-payment-status",
  WORKS_DELETE: "works:delete",
  REPORTS_DOCTOR_UNPAID: "reports:doctor-unpaid",
  REPORTS_TECHNICIAN_SALARY: "reports:technician-salary",
  BACKUP_LIST: "backup:list",
  BACKUP_CREATE: "backup:create",
  BACKUP_RESTORE: "backup:restore",
  BACKUP_DELETE: "backup:delete",
  BACKUP_EXPORT: "backup:export",
  BACKUP_IMPORT_RESTORE: "backup:import-restore",
  SETTINGS_GET: "settings:get",
  SETTINGS_UPDATE: "settings:update",
} as const;

export interface LabManagerApi {
  auth: {
    isConfigured: () => Promise<IpcResult<AuthIsConfiguredResponse>>;
    setPassword: (payload: AuthSetPasswordRequest) => Promise<IpcResult<void>>;
    login: (payload: AuthLoginRequest) => Promise<IpcResult<AuthLoginResponse>>;
    logout: () => Promise<IpcResult<void>>;
    changePassword: (payload: AuthChangePasswordRequest) => Promise<IpcResult<void>>;
    getSecurityInfo: () => Promise<IpcResult<AuthSecurityInfoResponse>>;
    resetPassword: () => Promise<IpcResult<void>>;
  };
  dashboard: {
    getSummary: () => Promise<IpcResult<DashboardSummary>>;
  };
  doctors: {
    list: () => Promise<IpcResult<DoctorListItem[]>>;
    get: (payload: { id: string }) => Promise<IpcResult<DoctorDto>>;
    create: (payload: CreateDoctorRequest) => Promise<IpcResult<DoctorDto>>;
    update: (payload: UpdateDoctorRequest) => Promise<IpcResult<DoctorDto>>;
    delete: (payload: DeleteDoctorRequest) => Promise<IpcResult<void>>;
  };
  technicians: {
    list: () => Promise<IpcResult<TechnicianDto[]>>;
    create: (payload: CreateTechnicianRequest) => Promise<IpcResult<TechnicianDto>>;
    update: (payload: UpdateTechnicianRequest) => Promise<IpcResult<TechnicianDto>>;
    delete: (payload: DeleteTechnicianRequest) => Promise<IpcResult<void>>;
  };
  workTypes: {
    list: () => Promise<IpcResult<WorkTypeDto[]>>;
    create: (payload: CreateWorkTypeRequest) => Promise<IpcResult<WorkTypeDto>>;
    update: (payload: UpdateWorkTypeRequest) => Promise<IpcResult<WorkTypeDto>>;
    delete: (payload: DeleteWorkTypeRequest) => Promise<IpcResult<void>>;
  };
  works: {
    list: () => Promise<IpcResult<WorkListItem[]>>;
    search: (payload: SearchWorksFilters) => Promise<IpcResult<WorkListItem[]>>;
    get: (payload: { id: string }) => Promise<IpcResult<WorkDto>>;
    create: (payload: CreateWorkRequest) => Promise<IpcResult<WorkDto>>;
    update: (payload: UpdateWorkRequest) => Promise<IpcResult<WorkDto>>;
    updatePaymentStatus: (payload: UpdateWorkPaymentStatusRequest) => Promise<IpcResult<WorkDto>>;
    delete: (payload: DeleteWorkRequest) => Promise<IpcResult<void>>;
  };
  reports: {
    getDoctorUnpaid: (payload: MonthReportRequest) => Promise<IpcResult<DoctorUnpaidReport>>;
    getTechnicianSalary: (payload: MonthReportRequest) => Promise<IpcResult<TechnicianSalaryReport>>;
  };
  backup: {
    list: () => Promise<IpcResult<BackupRecordDto[]>>;
    create: () => Promise<IpcResult<BackupRecordDto>>;
    restore: (payload: RestoreBackupRequest) => Promise<IpcResult<void>>;
    delete: (payload: DeleteBackupRequest) => Promise<IpcResult<void>>;
    export: (payload: ExportBackupRequest) => Promise<IpcResult<ExportBackupResponse>>;
    importAndRestore: () => Promise<IpcResult<ImportAndRestoreResponse>>;
  };
  settings: {
    get: () => Promise<IpcResult<AppSettingsDto>>;
    update: (payload: AppSettingsDto) => Promise<IpcResult<AppSettingsDto>>;
  };
}
