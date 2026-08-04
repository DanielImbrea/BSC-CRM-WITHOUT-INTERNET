import * as React from "react";
import { FileDown, Printer } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { exportApi } from "../api/export-api";

interface ReportExportButtonsProps {
  pdfFileName: string;
  children?: React.ReactNode;
}

async function waitForReportImages(): Promise<void> {
  const images = document.querySelectorAll<HTMLImageElement>(".report-print-document img");
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

export function ReportExportButtons({ pdfFileName, children }: ReportExportButtonsProps) {
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);
  const [exportError, setExportError] = React.useState<string | null>(null);

  function handlePrint() {
    window.print();
  }

  async function handleSavePdf() {
    setExportingPdf(true);
    setExportMessage(null);
    setExportError(null);

    document.documentElement.classList.add("report-pdf-export");
    document.querySelector(".report-print-document")?.scrollIntoView({ block: "start" });

    try {
      await waitForReportImages();
      await new Promise((resolve) => setTimeout(resolve, 80));

      const result = await exportApi.saveReportPdf({ suggestedFileName: pdfFileName });
      if (result.saved && result.path) {
        setExportMessage(`PDF salvat: ${result.path}`);
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Nu am putut salva PDF-ul.");
    } finally {
      document.documentElement.classList.remove("report-pdf-export");
      setExportingPdf(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 print:hidden">
      <div className="flex flex-wrap justify-end gap-2">
        {children}
        <Button variant="outline" onClick={() => void handleSavePdf()} disabled={exportingPdf} className="gap-2">
          <FileDown className="h-4 w-4" />
          {exportingPdf ? "Se generează PDF..." : "Salvează PDF"}
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Tipărește
        </Button>
      </div>
      {exportMessage && <p className="max-w-xl text-right text-xs text-muted-foreground">{exportMessage}</p>}
      {exportError && <p className="max-w-xl text-right text-xs text-destructive">{exportError}</p>}
    </div>
  );
}
