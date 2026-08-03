import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@shared-types/ipc";
import type { LabManagerApi } from "@shared-types/ipc";

const api: LabManagerApi = {
  auth: {
    isConfigured: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_IS_CONFIGURED),
    setPassword: (payload) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_SET_PASSWORD, payload),
    login: (payload) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN, payload),
    logout: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),
    changePassword: (payload) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_CHANGE_PASSWORD, payload),
    getSecurityInfo: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_SECURITY_INFO),
    resetPassword: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_RESET_PASSWORD),
  },
  dashboard: {
    getSummary: () => ipcRenderer.invoke(IPC_CHANNELS.DASHBOARD_GET_SUMMARY),
  },
  doctors: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.DOCTORS_LIST),
    get: (payload) => ipcRenderer.invoke(IPC_CHANNELS.DOCTORS_GET, payload),
    create: (payload) => ipcRenderer.invoke(IPC_CHANNELS.DOCTORS_CREATE, payload),
    update: (payload) => ipcRenderer.invoke(IPC_CHANNELS.DOCTORS_UPDATE, payload),
    delete: (payload) => ipcRenderer.invoke(IPC_CHANNELS.DOCTORS_DELETE, payload),
  },
  technicians: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.TECHNICIANS_LIST),
    create: (payload) => ipcRenderer.invoke(IPC_CHANNELS.TECHNICIANS_CREATE, payload),
    update: (payload) => ipcRenderer.invoke(IPC_CHANNELS.TECHNICIANS_UPDATE, payload),
    delete: (payload) => ipcRenderer.invoke(IPC_CHANNELS.TECHNICIANS_DELETE, payload),
  },
  workTypes: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.WORK_TYPES_LIST),
    create: (payload) => ipcRenderer.invoke(IPC_CHANNELS.WORK_TYPES_CREATE, payload),
    update: (payload) => ipcRenderer.invoke(IPC_CHANNELS.WORK_TYPES_UPDATE, payload),
    delete: (payload) => ipcRenderer.invoke(IPC_CHANNELS.WORK_TYPES_DELETE, payload),
  },
  works: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.WORKS_LIST),
    search: (payload) => ipcRenderer.invoke(IPC_CHANNELS.WORKS_SEARCH, payload),
    get: (payload) => ipcRenderer.invoke(IPC_CHANNELS.WORKS_GET, payload),
    create: (payload) => ipcRenderer.invoke(IPC_CHANNELS.WORKS_CREATE, payload),
    update: (payload) => ipcRenderer.invoke(IPC_CHANNELS.WORKS_UPDATE, payload),
    updatePaymentStatus: (payload) =>
      ipcRenderer.invoke(IPC_CHANNELS.WORKS_UPDATE_PAYMENT_STATUS, payload),
    delete: (payload) => ipcRenderer.invoke(IPC_CHANNELS.WORKS_DELETE, payload),
  },
  reports: {
    getDoctorUnpaid: (payload) => ipcRenderer.invoke(IPC_CHANNELS.REPORTS_DOCTOR_UNPAID, payload),
    getTechnicianSalary: (payload) =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORTS_TECHNICIAN_SALARY, payload),
  },
  backup: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_LIST),
    create: () => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_CREATE),
    restore: (payload) => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_RESTORE, payload),
    delete: (payload) => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_DELETE, payload),
    export: (payload) => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_EXPORT, payload),
    importAndRestore: () => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_IMPORT_RESTORE),
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    update: (payload) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, payload),
  },
};

contextBridge.exposeInMainWorld("labManager", api);
