import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@shared-types/ipc";
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthIsConfiguredResponse,
  AuthSetPasswordRequest,
  AuthChangePasswordRequest,
  AuthSecurityInfoResponse,
  DashboardSummary,
  ClientDto,
  ClientListItem,
  CreateClientRequest,
  UpdateClientRequest,
  DeleteClientRequest,
  WorkListItem,
  WorkDto,
  CreateWorkRequest,
  UpdateWorkStatusRequest,
  DeleteWorkRequest,
  MaterialListItem,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  DeleteMaterialRequest,
  AdjustMaterialStockRequest,
  CostEntryDto,
  ListCostsFilters,
  CreateCostRequest,
  UpdateCostRequest,
  DeleteCostRequest,
  EmployeeDto,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  DeleteEmployeeRequest,
  SalaryEntryDto,
  ListSalariesFilters,
  CreateSalaryRequest,
  UpdateSalaryRequest,
  DeleteSalaryRequest,
  ReportDateRangeRequest,
  FinancialSummaryReportDto,
  ClientReportRowDto,
  EmployeeReportRowDto,
  BackupRecordDto,
  RestoreBackupRequest,
  DeleteBackupRequest,
  ExportBackupRequest,
  ExportBackupResponse,
  ImportAndRestoreResponse,
  AppSettingsDto,
  ListAuditLogFilters,
  AuditLogPageDto,
  IpcResult,
  LabManagerApi,
} from "@shared-types/ipc";

/**
 * Singurul punct prin care renderer-ul (React, fără acces Node) poate
 * comunica cu main process-ul. Fiecare metodă expusă aici corespunde
 * unui canal IPC explicit — renderer-ul nu poate invoca niciun alt
 * canal, chiar dacă ar încerca (contextIsolation + fără nodeIntegration).
 */
const api: LabManagerApi = {
  auth: {
    isConfigured: (): Promise<IpcResult<AuthIsConfiguredResponse>> =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_IS_CONFIGURED),
    setPassword: (payload: AuthSetPasswordRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_SET_PASSWORD, payload),
    login: (payload: AuthLoginRequest): Promise<IpcResult<AuthLoginResponse>> =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN, payload),
    logout: (): Promise<IpcResult<void>> => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),
    changePassword: (payload: AuthChangePasswordRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_CHANGE_PASSWORD, payload),
    getSecurityInfo: (): Promise<IpcResult<AuthSecurityInfoResponse>> =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_SECURITY_INFO),
  },
  dashboard: {
    getSummary: (): Promise<IpcResult<DashboardSummary>> =>
      ipcRenderer.invoke(IPC_CHANNELS.DASHBOARD_GET_SUMMARY),
  },
  clients: {
    list: (): Promise<IpcResult<ClientListItem[]>> => ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_LIST),
    get: (payload: { id: string }): Promise<IpcResult<ClientDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_GET, payload),
    create: (payload: CreateClientRequest): Promise<IpcResult<ClientDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_CREATE, payload),
    update: (payload: UpdateClientRequest): Promise<IpcResult<ClientDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_UPDATE, payload),
    delete: (payload: DeleteClientRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_DELETE, payload),
  },
  works: {
    list: (): Promise<IpcResult<WorkListItem[]>> => ipcRenderer.invoke(IPC_CHANNELS.WORKS_LIST),
    get: (payload: { id: string }): Promise<IpcResult<WorkDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.WORKS_GET, payload),
    create: (payload: CreateWorkRequest): Promise<IpcResult<WorkDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.WORKS_CREATE, payload),
    updateStatus: (payload: UpdateWorkStatusRequest): Promise<IpcResult<WorkDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.WORKS_UPDATE_STATUS, payload),
    delete: (payload: DeleteWorkRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.WORKS_DELETE, payload),
  },
  materials: {
    list: (): Promise<IpcResult<MaterialListItem[]>> => ipcRenderer.invoke(IPC_CHANNELS.MATERIALS_LIST),
    create: (payload: CreateMaterialRequest): Promise<IpcResult<MaterialListItem>> =>
      ipcRenderer.invoke(IPC_CHANNELS.MATERIALS_CREATE, payload),
    update: (payload: UpdateMaterialRequest): Promise<IpcResult<MaterialListItem>> =>
      ipcRenderer.invoke(IPC_CHANNELS.MATERIALS_UPDATE, payload),
    delete: (payload: DeleteMaterialRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.MATERIALS_DELETE, payload),
    adjustStock: (payload: AdjustMaterialStockRequest): Promise<IpcResult<MaterialListItem>> =>
      ipcRenderer.invoke(IPC_CHANNELS.MATERIALS_ADJUST_STOCK, payload),
  },
  costs: {
    list: (payload: ListCostsFilters): Promise<IpcResult<CostEntryDto[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.COSTS_LIST, payload),
    listCategories: (): Promise<IpcResult<string[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.COSTS_LIST_CATEGORIES),
    create: (payload: CreateCostRequest): Promise<IpcResult<CostEntryDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.COSTS_CREATE, payload),
    update: (payload: UpdateCostRequest): Promise<IpcResult<CostEntryDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.COSTS_UPDATE, payload),
    delete: (payload: DeleteCostRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.COSTS_DELETE, payload),
  },
  employees: {
    list: (): Promise<IpcResult<EmployeeDto[]>> => ipcRenderer.invoke(IPC_CHANNELS.EMPLOYEES_LIST),
    create: (payload: CreateEmployeeRequest): Promise<IpcResult<EmployeeDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.EMPLOYEES_CREATE, payload),
    update: (payload: UpdateEmployeeRequest): Promise<IpcResult<EmployeeDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.EMPLOYEES_UPDATE, payload),
    delete: (payload: DeleteEmployeeRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.EMPLOYEES_DELETE, payload),
  },
  salaries: {
    list: (payload: ListSalariesFilters): Promise<IpcResult<SalaryEntryDto[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.SALARIES_LIST, payload),
    create: (payload: CreateSalaryRequest): Promise<IpcResult<SalaryEntryDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.SALARIES_CREATE, payload),
    update: (payload: UpdateSalaryRequest): Promise<IpcResult<SalaryEntryDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.SALARIES_UPDATE, payload),
    delete: (payload: DeleteSalaryRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.SALARIES_DELETE, payload),
  },
  reports: {
    getFinancialSummary: (payload: ReportDateRangeRequest): Promise<IpcResult<FinancialSummaryReportDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORTS_FINANCIAL_SUMMARY, payload),
    getClientReport: (payload: ReportDateRangeRequest): Promise<IpcResult<ClientReportRowDto[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORTS_CLIENT_REPORT, payload),
    getEmployeeReport: (payload: ReportDateRangeRequest): Promise<IpcResult<EmployeeReportRowDto[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORTS_EMPLOYEE_REPORT, payload),
  },
  backup: {
    list: (): Promise<IpcResult<BackupRecordDto[]>> => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_LIST),
    create: (): Promise<IpcResult<BackupRecordDto>> => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_CREATE),
    restore: (payload: RestoreBackupRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.BACKUP_RESTORE, payload),
    delete: (payload: DeleteBackupRequest): Promise<IpcResult<void>> =>
      ipcRenderer.invoke(IPC_CHANNELS.BACKUP_DELETE, payload),
    export: (payload: ExportBackupRequest): Promise<IpcResult<ExportBackupResponse>> =>
      ipcRenderer.invoke(IPC_CHANNELS.BACKUP_EXPORT, payload),
    importAndRestore: (): Promise<IpcResult<ImportAndRestoreResponse>> =>
      ipcRenderer.invoke(IPC_CHANNELS.BACKUP_IMPORT_RESTORE),
  },
  settings: {
    get: (): Promise<IpcResult<AppSettingsDto>> => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    update: (payload: AppSettingsDto): Promise<IpcResult<AppSettingsDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, payload),
  },
  auditLog: {
    list: (payload: ListAuditLogFilters): Promise<IpcResult<AuditLogPageDto>> =>
      ipcRenderer.invoke(IPC_CHANNELS.AUDIT_LOG_LIST, payload),
    listEntityTypes: (): Promise<IpcResult<string[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.AUDIT_LOG_LIST_ENTITY_TYPES),
    listActions: (): Promise<IpcResult<string[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.AUDIT_LOG_LIST_ACTIONS),
  },
};

contextBridge.exposeInMainWorld("labManager", api);
