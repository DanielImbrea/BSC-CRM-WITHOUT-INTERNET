export function buildReportPdfFileName(prefix: string, personName: string, month: string): string {
  const safeName = personName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${prefix}-${safeName || "raport"}-${month}.pdf`;
}
