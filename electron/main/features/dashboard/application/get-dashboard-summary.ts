import { getPrismaClient } from "../../../shared/db";
import type { DashboardSummary, WorkStatus } from "@shared-types/ipc";

function monthRange(date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

/**
 * Sumarul de pe Dashboard citește din mai multe module (Lucrări, Clienți,
 * Costuri) — e singurul loc unde permitem agregare cross-feature directă
 * în application layer, ca să evităm N interogări separate din renderer.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const db = getPrismaClient();
  const { start, end } = monthRange();

  const [activeWorksCount, totalClients, completedWorksThisMonth, costsAggregate, recentWorksRaw] =
    await Promise.all([
      db.work.count({ where: { status: "IN_PROGRESS" } }),
      db.client.count(),
      db.work.count({
        where: { status: "COMPLETED", updatedAt: { gte: start, lt: end } },
      }),
      db.costEntry.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lt: end } },
      }),
      db.work.findMany({
        take: 5,
        orderBy: { startedAt: "desc" },
        include: { client: { select: { name: true } } },
      }),
    ]);

  return {
    activeWorksCount,
    completedWorksThisMonth,
    totalClients,
    totalCostsThisMonth: costsAggregate._sum.amount ?? 0,
    recentWorks: recentWorksRaw.map((work) => ({
      id: work.id,
      title: work.title,
      clientName: work.client.name,
      status: work.status as WorkStatus,
      startedAt: work.startedAt.toISOString(),
    })),
  };
}
