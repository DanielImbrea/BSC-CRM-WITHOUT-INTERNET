import { registerAuthHandlers } from "./features/auth/ipc/auth-handlers";
import { registerDashboardHandlers } from "./features/dashboard/ipc/dashboard-handlers";
import { registerClientsHandlers } from "./features/clients/ipc/clients-handlers";
import { registerWorksHandlers } from "./features/works/ipc/works-handlers";
import { registerMaterialsHandlers } from "./features/materials/ipc/materials-handlers";
import { registerCostsHandlers } from "./features/costs/ipc/costs-handlers";
import { registerEmployeesHandlers } from "./features/employees/ipc/employees-handlers";
import { registerSalariesHandlers } from "./features/salaries/ipc/salaries-handlers";
import { registerReportsHandlers } from "./features/reports/ipc/reports-handlers";
import { registerBackupHandlers } from "./features/backup/ipc/backup-handlers";
import { registerSettingsHandlers } from "./features/settings/ipc/settings-handlers";
import { registerAuditLogHandlers } from "./features/audit-log/ipc/audit-log-handlers";

/**
 * Punct unic de înregistrare pentru toate handler-ele IPC.
 * Toate cele 12 module sunt înregistrate — orice extensie viitoare
 * adaugă aici o singură linie nouă, fără să atingă restul aplicației.
 */
export function registerAllIpcHandlers(): void {
  registerAuthHandlers();
  registerDashboardHandlers();
  registerClientsHandlers();
  registerWorksHandlers();
  registerMaterialsHandlers();
  registerCostsHandlers();
  registerEmployeesHandlers();
  registerSalariesHandlers();
  registerReportsHandlers();
  registerBackupHandlers();
  registerSettingsHandlers();
  registerAuditLogHandlers();
}
