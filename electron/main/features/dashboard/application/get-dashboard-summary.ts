import { getPrismaClient } from "../../../shared/db";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export async function getDashboardSummary() {
  requireAuthenticated();
  const db = getPrismaClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [worksThisMonth, unpaidWorks, doctorsCount, techniciansCount] = await Promise.all([
    db.work.count({ where: { entryDate: { gte: monthStart, lte: monthEnd } } }),
    db.work.count({ where: { paymentStatus: "NEPLATITA" } }),
    db.doctor.count(),
    db.technician.count({ where: { active: true } }),
  ]);

  return { worksThisMonth, unpaidWorks, doctorsCount, techniciansCount };
}
