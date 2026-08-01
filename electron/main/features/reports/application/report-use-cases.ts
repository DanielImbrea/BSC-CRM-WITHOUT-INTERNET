import { costsRepository } from "../../costs/infrastructure/costs-repository";
import { salariesRepository } from "../../salaries/infrastructure/salaries-repository";
import { worksRepository } from "../../works/infrastructure/works-repository";
import { assertDateRangeIsValid, toPeriodString, type DateRange } from "../domain/report-date-range";
import { requireAuthenticated } from "../../auth/application/auth-use-cases";

export interface FinancialSummaryReport {
  totalCosts: number;
  totalSalaries: number;
  completedWorksCount: number;
  costsByCategory: { category: string; amount: number }[];
}

export interface ClientReportRow {
  clientName: string;
  workCount: number;
  totalCost: number;
}

export interface EmployeeReportRow {
  employeeName: string;
  entriesCount: number;
  totalNet: number;
}

/**
 * Modulul Rapoarte nu introduce tabele noi — e un strat de agregare
 * peste datele deja existente în Costuri, Salarii și Lucrări. Fiecare
 * raport e read-only și reutilizează repository-urile modulelor sursă,
 * exact cum face deja Dashboard-ul cu sumarul lui.
 */
export async function getFinancialSummaryReport(range: DateRange): Promise<FinancialSummaryReport> {
  requireAuthenticated();
  assertDateRangeIsValid(range);

  const costs = await costsRepository.findAll({ dateFrom: range.dateFrom, dateTo: range.dateTo });
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);

  const categoryTotals = new Map<string, number>();
  for (const cost of costs) {
    categoryTotals.set(cost.category, (categoryTotals.get(cost.category) ?? 0) + cost.amount);
  }
  const costsByCategory = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const periodFrom = toPeriodString(range.dateFrom);
  const periodTo = toPeriodString(range.dateTo);
  const allSalaries = await salariesRepository.findAll({});
  const salariesInRange = allSalaries.filter((s) => s.period >= periodFrom && s.period <= periodTo);
  const totalSalaries = salariesInRange.reduce((sum, s) => sum + s.netAmount, 0);

  const allWorks = await worksRepository.findAll();
  const completedWorksCount = allWorks.filter(
    (w) => w.status === "COMPLETED" && w.startedAt >= range.dateFrom && w.startedAt <= range.dateTo,
  ).length;

  return { totalCosts, totalSalaries, completedWorksCount, costsByCategory };
}

export async function getClientReport(range: DateRange): Promise<ClientReportRow[]> {
  requireAuthenticated();
  assertDateRangeIsValid(range);

  const allWorks = await worksRepository.findAll();
  const worksInRange = allWorks.filter((w) => w.startedAt >= range.dateFrom && w.startedAt <= range.dateTo);

  const byClient = new Map<string, { workCount: number; totalCost: number }>();
  for (const work of worksInRange) {
    const entry = byClient.get(work.clientName) ?? { workCount: 0, totalCost: 0 };
    entry.workCount += 1;
    entry.totalCost += work.totalCost;
    byClient.set(work.clientName, entry);
  }

  return Array.from(byClient.entries())
    .map(([clientName, data]) => ({ clientName, ...data }))
    .sort((a, b) => b.totalCost - a.totalCost);
}

export async function getEmployeeReport(range: DateRange): Promise<EmployeeReportRow[]> {
  requireAuthenticated();
  assertDateRangeIsValid(range);

  const periodFrom = toPeriodString(range.dateFrom);
  const periodTo = toPeriodString(range.dateTo);
  const allSalaries = await salariesRepository.findAll({});
  const salariesInRange = allSalaries.filter((s) => s.period >= periodFrom && s.period <= periodTo);

  const byEmployee = new Map<string, { entriesCount: number; totalNet: number }>();
  for (const salary of salariesInRange) {
    const entry = byEmployee.get(salary.employeeName) ?? { entriesCount: 0, totalNet: 0 };
    entry.entriesCount += 1;
    entry.totalNet += salary.netAmount;
    byEmployee.set(salary.employeeName, entry);
  }

  return Array.from(byEmployee.entries())
    .map(([employeeName, data]) => ({ employeeName, ...data }))
    .sort((a, b) => b.totalNet - a.totalNet);
}
