import * as React from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { BrandLogo } from "@/shared/components/brand-logo";

interface ReportPrintLayoutProps {
  id: string;
  personName: string;
  reportTitle: string;
  children: React.ReactNode;
}

export function ReportPrintLayout({ id, personName, reportTitle, children }: ReportPrintLayoutProps) {
  const generatedAt = format(new Date(), "d MMMM yyyy, HH:mm", { locale: ro });

  return (
    <div
      id={id}
      className="report-print-document rounded-lg border border-border bg-card p-6 print:border-0 print:bg-white print:p-0"
    >
      <div className="report-print-sheet">
        <header className="report-print-header hidden">
          <div className="report-print-letterhead">
            <BrandLogo height={52} className="report-print-logo" />
            <div className="report-print-letterhead-text">
              <p className="report-print-brand-name">Billionaire Smile Club CRM</p>
              <p className="report-print-brand-tag">Laborator dentar · Management financiar</p>
            </div>
          </div>

          <div className="report-print-title-card">
            <p className="report-print-doc-label">Raport</p>
            <h1>{personName}</h1>
            <p className="report-print-subtitle">{reportTitle}</p>
          </div>
        </header>

        <div className="print:hidden">
          <h2 className="mb-1 text-lg font-semibold text-foreground">{personName}</h2>
          <p className="mb-4 text-sm text-muted-foreground">{reportTitle}</p>
        </div>

        <div className="report-print-body">{children}</div>

        <footer className="report-print-footer hidden">
          <p className="report-print-footer-brand">Billionaire Smile Club CRM</p>
          <p>Generat la {generatedAt}</p>
        </footer>
      </div>
    </div>
  );
}
