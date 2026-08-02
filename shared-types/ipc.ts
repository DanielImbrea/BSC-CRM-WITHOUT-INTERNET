/**
 * Contractul IPC dintre Electron main process și renderer (React).
 * Orice canal nou adăugat într-un modul TREBUIE declarat aici,
 * ca renderer-ul să aibă tipare completă fără `any`.
 */

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
  configured: boolean; // false = nu există încă parolă setată (prima rulare)
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
// Clienți
// ---------------------------------------------------------------------------
export interface ClientDto {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  worksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  worksCount: number;
}

export interface CreateClientRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateClientRequest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface DeleteClientRequest {
  id: string;
}

// ---------------------------------------------------------------------------
// Lucrări
// ---------------------------------------------------------------------------
export type WorkStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface WorkListItem {
  id: string;
  title: string;
  clientName: string;
  status: WorkStatus;
  startedAt: string;
  totalCost: number; // în bani — costuri directe + materiale consumate
}

export interface WorkMaterialDto {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  unitCostAtTime: number; // în bani
}

export interface WorkCostDto {
  id: string;
  description: string;
  amount: number; // în bani
  category: string;
}

export interface WorkDto {
  id: string;
  title: string;
  status: WorkStatus;
  clientId: string;
  clientName: string;
  startedAt: string;
  finishedAt: string | null;
  materials: WorkMaterialDto[];
  costs: WorkCostDto[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkMaterialInput {
  materialName: string;
  quantity: number;
}

export interface CreateWorkCostInput {
  description: string;
  amount: number;
  category: string;
}

export interface CreateWorkRequest {
  title: string;
  clientId: string;
  materials: CreateWorkMaterialInput[];
  costs: CreateWorkCostInput[];
}

export interface UpdateWorkStatusRequest {
  id: string;
  status: WorkStatus;
}

export interface DeleteWorkRequest {
  id: string;
}

// ---------------------------------------------------------------------------
// Costuri
// ---------------------------------------------------------------------------
export interface CostEntryDto {
  id: string;
  description: string;
  amount: number; // în bani
  category: string;
  date: string; // ISO
  workId: string | null;
  workTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListCostsFilters {
  category?: string;
  dateFrom?: string; // ISO
  dateTo?: string; // ISO
}

export interface CreateCostRequest {
  description: string;
  amount: number;
  category: string;
  date: string; // ISO
  workId?: string;
}

export interface UpdateCostRequest {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  workId?: string;
}

export interface DeleteCostRequest {
  id: string;
}

// ---------------------------------------------------------------------------
// Angajați
// ---------------------------------------------------------------------------
export interface EmployeeDto {
  id: string;
  name: string;
  position: string | null;
  active: boolean;
}

export interface CreateEmployeeRequest {
  name: string;
  position?: string;
  active?: boolean;
}

export interface UpdateEmployeeRequest {
  id: string;
  name: string;
  position?: string;
  active?: boolean;
}

export interface DeleteEmployeeRequest {
  id: string;
}

// ---------------------------------------------------------------------------
// Salarii
// ---------------------------------------------------------------------------
export interface SalaryEntryDto {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // "YYYY-MM"
  baseAmount: number; // în bani
  bonuses: number;
  deductions: number;
  netAmount: number;
  paidAt: string | null;
}

export interface ListSalariesFilters {
  employeeId?: string;
  period?: string;
}

export interface CreateSalaryRequest {
  employeeId: string;
  period: string;
  baseAmount: number;
  bonuses: number;
  deductions: number;
  paidAt?: string;
}

export interface UpdateSalaryRequest {
  id: string;
  employeeId: string;
  period: string;
  baseAmount: number;
  bonuses: number;
  deductions: number;
  paidAt?: string;
}

export interface DeleteSalaryRequest {
  id: string;
}

// ---------------------------------------------------------------------------
// Rapoarte
// ---------------------------------------------------------------------------
export interface ReportDateRangeRequest {
  dateFrom: string; // ISO
  dateTo: string; // ISO
}

export interface FinancialSummaryReportDto {
  totalCosts: number; // în bani
  totalSalaries: number; // în bani
  completedWorksCount: number;
  costsByCategory: { category: string; amount: number }[];
}

export interface ClientReportRowDto {
  clientName: string;
  workCount: number;
  totalCost: number; // în bani
}

export interface EmployeeReportRowDto {
  employeeName: string;
  entriesCount: number;
  totalNet: number; // în bani
}

// ---------------------------------------------------------------------------
// Backup
// ---------------------------------------------------------------------------
export interface BackupRecordDto {
  id: string;
  filePath: string;
  sizeBytes: number;
  type: "MANUAL" | "AUTO";
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
  exported: boolean;
  path: string | null;
}

export interface ImportAndRestoreResponse {
  restored: boolean;
}

// ---------------------------------------------------------------------------
// Setări
// ---------------------------------------------------------------------------
export interface AppSettingsDto {
  autoBackupEnabled: boolean;
  maxBackupsRetained: number;
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------
export interface AuditLogEntryDto {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  before: string | null;
  after: string | null;
  createdAt: string;
}

export interface ListAuditLogFilters {
  entityType?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  take?: number;
}

export interface AuditLogPageDto {
  entries: AuditLogEntryDto[];
  total: number;
}

// ---------------------------------------------------------------------------
// Materiale
// ---------------------------------------------------------------------------
export interface MaterialListItem {
  id: string;
  name: string;
  unit: string;
  unitCost: number; // în bani
  stockQuantity: number;
  minStockQuantity: number;
}

export interface CreateMaterialRequest {
  name: string;
  unit: string;
  unitCost: number;
  stockQuantity?: number;
  minStockQuantity?: number;
}

export interface UpdateMaterialRequest {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
  minStockQuantity?: number;
}

export interface DeleteMaterialRequest {
  id: string;
}

export interface AdjustMaterialStockRequest {
  id: string;
  delta: number;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export interface DashboardSummary {
  activeWorksCount: number;
  completedWorksThisMonth: number;
  totalClients: number;
  totalCostsThisMonth: number; // în bani (subunități monetare)
  recentWorks: DashboardRecentWork[];
}

export interface DashboardRecentWork {
  id: string;
  title: string;
  clientName: string;
  status: WorkStatus;
  startedAt: string; // ISO date
}

// ---------------------------------------------------------------------------
// Envelope generic de răspuns pentru toate canalele IPC
// ---------------------------------------------------------------------------
export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Numele canalelor IPC (single source of truth — evită typo-uri pe string-uri)
// ---------------------------------------------------------------------------
export const IPC_CHANNELS = {
  AUTH_IS_CONFIGURED: "auth:is-configured",
  AUTH_SET_PASSWORD: "auth:set-password",
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_CHANGE_PASSWORD: "auth:change-password",
  AUTH_GET_SECURITY_INFO: "auth:get-security-info",
  DASHBOARD_GET_SUMMARY: "dashboard:get-summary",
  CLIENTS_LIST: "clients:list",
  CLIENTS_GET: "clients:get",
  CLIENTS_CREATE: "clients:create",
  CLIENTS_UPDATE: "clients:update",
  CLIENTS_DELETE: "clients:delete",
  WORKS_LIST: "works:list",
  WORKS_GET: "works:get",
  WORKS_CREATE: "works:create",
  WORKS_UPDATE_STATUS: "works:update-status",
  WORKS_DELETE: "works:delete",
  MATERIALS_LIST: "materials:list",
  MATERIALS_CREATE: "materials:create",
  MATERIALS_UPDATE: "materials:update",
  MATERIALS_DELETE: "materials:delete",
  MATERIALS_ADJUST_STOCK: "materials:adjust-stock",
  COSTS_LIST: "costs:list",
  COSTS_LIST_CATEGORIES: "costs:list-categories",
  COSTS_CREATE: "costs:create",
  COSTS_UPDATE: "costs:update",
  COSTS_DELETE: "costs:delete",
  EMPLOYEES_LIST: "employees:list",
  EMPLOYEES_CREATE: "employees:create",
  EMPLOYEES_UPDATE: "employees:update",
  EMPLOYEES_DELETE: "employees:delete",
  SALARIES_LIST: "salaries:list",
  SALARIES_CREATE: "salaries:create",
  SALARIES_UPDATE: "salaries:update",
  SALARIES_DELETE: "salaries:delete",
  REPORTS_FINANCIAL_SUMMARY: "reports:financial-summary",
  REPORTS_CLIENT_REPORT: "reports:client-report",
  REPORTS_EMPLOYEE_REPORT: "reports:employee-report",
  BACKUP_LIST: "backup:list",
  BACKUP_CREATE: "backup:create",
  BACKUP_RESTORE: "backup:restore",
  BACKUP_DELETE: "backup:delete",
  BACKUP_EXPORT: "backup:export",
  BACKUP_IMPORT_RESTORE: "backup:import-restore",
  SETTINGS_GET: "settings:get",
  SETTINGS_UPDATE: "settings:update",
  AUDIT_LOG_LIST: "audit-log:list",
  AUDIT_LOG_LIST_ENTITY_TYPES: "audit-log:list-entity-types",
  AUDIT_LOG_LIST_ACTIONS: "audit-log:list-actions",
} as const;

// ---------------------------------------------------------------------------
// Forma API-ului expus în renderer prin contextBridge (window.labManager).
// Definit aici — nu în electron/preload — ca renderer-ul (tsconfig separat,
// fără acces la tipurile Node/Electron) să-l poată importa fără să tragă
// după el tot codul de main process.
// ---------------------------------------------------------------------------
export interface LabManagerApi {
  auth: {
    isConfigured: () => Promise<IpcResult<AuthIsConfiguredResponse>>;
    setPassword: (payload: AuthSetPasswordRequest) => Promise<IpcResult<void>>;
    login: (payload: AuthLoginRequest) => Promise<IpcResult<AuthLoginResponse>>;
    logout: () => Promise<IpcResult<void>>;
    changePassword: (payload: AuthChangePasswordRequest) => Promise<IpcResult<void>>;
    getSecurityInfo: () => Promise<IpcResult<AuthSecurityInfoResponse>>;
  };
  dashboard: {
    getSummary: () => Promise<IpcResult<DashboardSummary>>;
  };
  clients: {
    list: () => Promise<IpcResult<ClientListItem[]>>;
    get: (payload: { id: string }) => Promise<IpcResult<ClientDto>>;
    create: (payload: CreateClientRequest) => Promise<IpcResult<ClientDto>>;
    update: (payload: UpdateClientRequest) => Promise<IpcResult<ClientDto>>;
    delete: (payload: DeleteClientRequest) => Promise<IpcResult<void>>;
  };
  works: {
    list: () => Promise<IpcResult<WorkListItem[]>>;
    get: (payload: { id: string }) => Promise<IpcResult<WorkDto>>;
    create: (payload: CreateWorkRequest) => Promise<IpcResult<WorkDto>>;
    updateStatus: (payload: UpdateWorkStatusRequest) => Promise<IpcResult<WorkDto>>;
    delete: (payload: DeleteWorkRequest) => Promise<IpcResult<void>>;
  };
  materials: {
    list: () => Promise<IpcResult<MaterialListItem[]>>;
    create: (payload: CreateMaterialRequest) => Promise<IpcResult<MaterialListItem>>;
    update: (payload: UpdateMaterialRequest) => Promise<IpcResult<MaterialListItem>>;
    delete: (payload: DeleteMaterialRequest) => Promise<IpcResult<void>>;
    adjustStock: (payload: AdjustMaterialStockRequest) => Promise<IpcResult<MaterialListItem>>;
  };
  costs: {
    list: (payload: ListCostsFilters) => Promise<IpcResult<CostEntryDto[]>>;
    listCategories: () => Promise<IpcResult<string[]>>;
    create: (payload: CreateCostRequest) => Promise<IpcResult<CostEntryDto>>;
    update: (payload: UpdateCostRequest) => Promise<IpcResult<CostEntryDto>>;
    delete: (payload: DeleteCostRequest) => Promise<IpcResult<void>>;
  };
  employees: {
    list: () => Promise<IpcResult<EmployeeDto[]>>;
    create: (payload: CreateEmployeeRequest) => Promise<IpcResult<EmployeeDto>>;
    update: (payload: UpdateEmployeeRequest) => Promise<IpcResult<EmployeeDto>>;
    delete: (payload: DeleteEmployeeRequest) => Promise<IpcResult<void>>;
  };
  salaries: {
    list: (payload: ListSalariesFilters) => Promise<IpcResult<SalaryEntryDto[]>>;
    create: (payload: CreateSalaryRequest) => Promise<IpcResult<SalaryEntryDto>>;
    update: (payload: UpdateSalaryRequest) => Promise<IpcResult<SalaryEntryDto>>;
    delete: (payload: DeleteSalaryRequest) => Promise<IpcResult<void>>;
  };
  reports: {
    getFinancialSummary: (payload: ReportDateRangeRequest) => Promise<IpcResult<FinancialSummaryReportDto>>;
    getClientReport: (payload: ReportDateRangeRequest) => Promise<IpcResult<ClientReportRowDto[]>>;
    getEmployeeReport: (payload: ReportDateRangeRequest) => Promise<IpcResult<EmployeeReportRowDto[]>>;
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
  auditLog: {
    list: (payload: ListAuditLogFilters) => Promise<IpcResult<AuditLogPageDto>>;
    listEntityTypes: () => Promise<IpcResult<string[]>>;
    listActions: () => Promise<IpcResult<string[]>>;
  };
}
