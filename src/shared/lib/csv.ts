/**
 * Generează și descarcă un fișier CSV din date tabulare.
 * Fără dependențe externe — Blob + link temporar, funcționează 100% offline.
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (cell: string | number): string => {
    const value = String(cell);
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // BOM UTF-8, ca diacriticele să se afișeze corect la deschiderea în Excel.
  const csvContent = "\uFEFF" + lines.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
