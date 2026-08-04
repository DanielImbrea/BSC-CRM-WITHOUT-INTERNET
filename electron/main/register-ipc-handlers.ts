import { registerAuthHandlers } from "./features/auth/ipc/auth-handlers";
import { registerDashboardHandlers } from "./features/dashboard/ipc/dashboard-handlers";
import { registerDoctorsHandlers } from "./features/doctors/ipc/doctors-handlers";
import { registerTechniciansHandlers } from "./features/technicians/ipc/technicians-handlers";
import { registerWorkTypesHandlers } from "./features/work-types/ipc/work-types-handlers";
import { registerWorksHandlers } from "./features/works/ipc/works-handlers";
import { registerReportsHandlers } from "./features/reports/ipc/reports-handlers";
import { registerBackupHandlers } from "./features/backup/ipc/backup-handlers";
import { registerSettingsHandlers } from "./features/settings/ipc/settings-handlers";
import { registerRatesHandlers } from "./features/rates/ipc/rates-handlers";
import { registerExportHandlers } from "./features/export/ipc/export-handlers";

export function registerAllIpcHandlers(): void {
  registerAuthHandlers();
  registerDashboardHandlers();
  registerDoctorsHandlers();
  registerTechniciansHandlers();
  registerWorkTypesHandlers();
  registerWorksHandlers();
  registerReportsHandlers();
  registerBackupHandlers();
  registerSettingsHandlers();
  registerRatesHandlers();
  registerExportHandlers();
}
