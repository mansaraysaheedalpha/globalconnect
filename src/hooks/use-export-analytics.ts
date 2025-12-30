// src/hooks/use-export-analytics.ts
"use client";

import { useState, useCallback } from "react";
import {
  exportToCSV,
  downloadCSV,
  exportToExcel,
  downloadExcel,
  downloadPDF,
  generateHTMLReport,
  formatAnalyticsData,
} from "@/lib/export-utils";
import type { MonetizationAnalytics } from "@/types/analytics";

interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  title: string;
  sections: string[];
  dateRange: { from: string; to: string };
}

/**
 * Hook to export analytics data in various formats
 */
export function useExportAnalytics(analyticsData?: MonetizationAnalytics) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(
    async (options: ExportOptions) => {
      setExporting(true);
      setError(null);

      try {
        // Format the data for export
        const formattedData = formatAnalyticsData(
          {
            ...analyticsData,
            dateRange: options.dateRange,
          },
          options.sections
        );

        formattedData.title = options.title;

        // Generate filename
        const timestamp = new Date().toISOString().split("T")[0];
        const filename = `${options.title.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;

        // Export based on format
        switch (options.format) {
          case "csv": {
            const csv = exportToCSV(formattedData);
            downloadCSV(csv, `${filename}.csv`);
            break;
          }

          case "excel": {
            const blob = await exportToExcel(formattedData);
            downloadExcel(blob, `${filename}.xlsx`);
            break;
          }

          case "pdf": {
            const html = generateHTMLReport(formattedData);
            downloadPDF(html, `${filename}.pdf`);
            break;
          }
        }

        setExporting(false);
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Export failed";
        setError(errorMessage);
        setExporting(false);
        return { success: false, error: errorMessage };
      }
    },
    [analyticsData]
  );

  return {
    exportData,
    exporting,
    error,
  };
}
