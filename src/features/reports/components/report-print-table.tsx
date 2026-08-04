import * as React from "react";

interface ReportPrintTableProps {
  columns: React.ReactNode;
  children: React.ReactNode;
  totalLabel?: React.ReactNode;
  totalValue?: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function ReportPrintTable({
  columns,
  children,
  totalLabel,
  totalValue,
  emptyMessage = "Nicio înregistrare.",
  isEmpty = false,
}: ReportPrintTableProps) {
  if (isEmpty) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <table className="report-print-table w-full border-collapse text-sm">
      <thead>
        <tr>{columns}</tr>
      </thead>
      <tbody>
        {children}
        {totalLabel != null && totalValue != null && (
          <tr className="report-print-total-row">
            {totalLabel}
            {totalValue}
          </tr>
        )}
      </tbody>
    </table>
  );
}

export function ReportPrintTh({
  children,
  align = "left",
  narrow = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  narrow?: boolean;
}) {
  return (
    <th
      className={[
        "report-print-th py-2 pr-4 text-left text-xs font-medium text-muted-foreground",
        align === "right" ? "text-right" : "",
        align === "center" ? "text-center" : "",
        narrow ? "report-print-col-index" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </th>
  );
}

export function ReportPrintTd({
  children,
  align = "left",
  muted = false,
  colSpan,
  narrow = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  muted?: boolean;
  colSpan?: number;
  narrow?: boolean;
}) {
  return (
    <td
      colSpan={colSpan}
      className={[
        "report-print-td border-b border-border py-2 pr-4",
        align === "right" ? "text-right font-medium" : "",
        align === "center" ? "text-center" : "",
        muted ? "text-muted-foreground" : "",
        narrow ? "report-print-col-index" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </td>
  );
}
