// src/lib/export-utils.ts

import { escapeHtml, sanitizeForExport } from "./sanitize";
import type { ExportData, OfferPerformance, AdPerformance, MonetizationAnalytics } from "@/types/analytics";

/**
 * Export Analytics Utilities
 *
 * Functions for exporting analytics data in various formats
 * All user-generated content is sanitized to prevent XSS attacks
 */

/**
 * Export analytics data as CSV
 */
export function exportToCSV(data: ExportData): string {
  let csv = `${data.title}\n`;
  csv += `Date Range: ${data.dateRange.from} to ${data.dateRange.to}\n\n`;

  // Revenue Section
  if (data.sections.revenue) {
    csv += "REVENUE OVERVIEW\n";
    csv += "Metric,Value\n";
    csv += `Total Revenue,$${data.sections.revenue.total.toFixed(2)}\n`;
    csv += `Offers Revenue,$${data.sections.revenue.fromOffers.toFixed(2)}\n`;
    csv += `Ads Revenue,$${data.sections.revenue.fromAds.toFixed(2)}\n`;
    csv += `Conversion Rate,${data.sections.revenue.conversionRate.toFixed(2)}%\n\n`;
  }

  // Offers Section
  if (data.sections.offers) {
    csv += "OFFER PERFORMANCE\n";
    csv += "Offer Name,Views,Purchases,Conversion Rate,Revenue\n";
    data.sections.offers.topPerformers.forEach((offer: OfferPerformance) => {
      csv += `${offer.name},${offer.views},${offer.purchases},${offer.conversionRate.toFixed(2)}%,$${offer.revenue.toFixed(2)}\n`;
    });
    csv += "\n";
  }

  // Ads Section
  if (data.sections.ads) {
    csv += "AD CAMPAIGN ANALYTICS\n";
    csv += "Ad Name,Impressions,Clicks,CTR\n";
    data.sections.ads.topPerformers.forEach((ad: AdPerformance) => {
      csv += `${ad.name},${ad.impressions},${ad.clicks},${ad.ctr.toFixed(2)}%\n`;
    });
    csv += "\n";
  }

  // Waitlist Section
  if (data.sections.waitlist) {
    csv += "WAITLIST METRICS\n";
    csv += "Metric,Value\n";
    csv += `Total Joins,${data.sections.waitlist.totalJoins}\n`;
    csv += `Offers Issued,${data.sections.waitlist.offersIssued}\n`;
    csv += `Acceptance Rate,${data.sections.waitlist.acceptanceRate.toFixed(2)}%\n`;
    csv += `Average Wait Time,${data.sections.waitlist.averageWaitTimeMinutes} minutes\n\n`;
  }

  return csv;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export analytics data as Excel (XLSX)
 * Note: Requires a library like xlsx or exceljs
 * This is a placeholder that would use such a library
 */
export async function exportToExcel(data: ExportData): Promise<Blob> {
  // TODO: Implement using xlsx or exceljs library
  // This would create a multi-sheet workbook with charts

  // For now, return CSV as fallback
  const csv = exportToCSV(data);
  return new Blob([csv], { type: "application/vnd.ms-excel" });
}

/**
 * Download Excel file
 */
export function downloadExcel(blob: Blob, filename: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export analytics data as PDF
 * Note: This would typically be done server-side
 */
export async function exportToPDF(data: ExportData): Promise<Blob> {
  // TODO: Implement using server-side PDF generation
  // This would call a backend endpoint that uses libraries like:
  // - Python: reportlab, weasyprint
  // - Node.js: puppeteer, pdfkit

  // For now, return a placeholder
  const html = generateHTMLReport(data);
  return new Blob([html], { type: "text/html" });
}

/**
 * Generate HTML report (can be used for PDF or print)
 */
export function generateHTMLReport(data: ExportData): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
    }
    h2 {
      color: #4b5563;
      margin-top: 30px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .metadata {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    tr:hover {
      background: #f9fafb;
    }
    .metric-card {
      display: inline-block;
      background: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin: 10px 10px 10px 0;
      min-width: 200px;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #1e40af;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    @media print {
      body {
        margin: 0;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(data.title)}</h1>

  <div class="metadata">
    <strong>Date Range:</strong> ${escapeHtml(data.dateRange.from)} to ${escapeHtml(data.dateRange.to)}<br>
    <strong>Generated:</strong> ${new Date().toLocaleString()}
  </div>
`;

  // Revenue Section
  if (data.sections.revenue) {
    html += `
  <h2>Revenue Overview</h2>
  <div class="metric-card">
    <div class="metric-label">Total Revenue</div>
    <div class="metric-value">$${data.sections.revenue.total.toFixed(2)}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Offers Revenue</div>
    <div class="metric-value">$${data.sections.revenue.fromOffers.toFixed(2)}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Ads Revenue</div>
    <div class="metric-value">$${data.sections.revenue.fromAds.toFixed(2)}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Conversion Rate</div>
    <div class="metric-value">${data.sections.revenue.conversionRate.toFixed(2)}%</div>
  </div>
`;
  }

  // Offers Section
  if (data.sections.offers) {
    html += `
  <h2>Offer Performance</h2>
  <table>
    <thead>
      <tr>
        <th>Offer Name</th>
        <th>Views</th>
        <th>Purchases</th>
        <th>Conversion Rate</th>
        <th>Revenue</th>
      </tr>
    </thead>
    <tbody>
`;
    data.sections.offers.topPerformers.forEach((offer: OfferPerformance) => {
      html += `
      <tr>
        <td>${escapeHtml(offer.name)}</td>
        <td>${offer.views.toLocaleString()}</td>
        <td>${offer.purchases.toLocaleString()}</td>
        <td>${offer.conversionRate.toFixed(2)}%</td>
        <td>$${offer.revenue.toFixed(2)}</td>
      </tr>
`;
    });
    html += `
    </tbody>
  </table>
`;
  }

  // Ads Section
  if (data.sections.ads) {
    html += `
  <h2>Ad Campaign Analytics</h2>
  <table>
    <thead>
      <tr>
        <th>Ad Name</th>
        <th>Impressions</th>
        <th>Clicks</th>
        <th>CTR</th>
      </tr>
    </thead>
    <tbody>
`;
    data.sections.ads.topPerformers.forEach((ad: AdPerformance) => {
      html += `
      <tr>
        <td>${escapeHtml(ad.name)}</td>
        <td>${ad.impressions.toLocaleString()}</td>
        <td>${ad.clicks.toLocaleString()}</td>
        <td>${ad.ctr.toFixed(2)}%</td>
      </tr>
`;
    });
    html += `
    </tbody>
  </table>
`;
  }

  // Waitlist Section
  if (data.sections.waitlist) {
    html += `
  <h2>Waitlist Metrics</h2>
  <div class="metric-card">
    <div class="metric-label">Total Joins</div>
    <div class="metric-value">${data.sections.waitlist.totalJoins}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Offers Issued</div>
    <div class="metric-value">${data.sections.waitlist.offersIssued}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Acceptance Rate</div>
    <div class="metric-value">${data.sections.waitlist.acceptanceRate.toFixed(2)}%</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Avg Wait Time</div>
    <div class="metric-value">${data.sections.waitlist.averageWaitTimeMinutes} min</div>
  </div>
`;
  }

  html += `
  <div class="footer">
    Generated with Event Dynamics Event Platform • ${new Date().getFullYear()}
  </div>
</body>
</html>
`;

  return html;
}

/**
 * Download PDF file (prints HTML or calls server)
 */
export function downloadPDF(html: string, filename: string) {
  // Option 1: Open in new window for print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  // Option 2: Call server-side PDF generation endpoint
  // fetch('/api/v1/reports/generate-pdf', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ html })
  // }).then(res => res.blob()).then(blob => {
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = filename;
  //   link.click();
  //   URL.revokeObjectURL(url);
  // });
}

/**
 * Format analytics data for export
 */
export function formatAnalyticsData(rawData: any, sections: string[]): ExportData {
  const exportData: ExportData = {
    title: "Monetization Analytics Report",
    dateRange: rawData.dateRange,
    sections: {},
  };

  if (sections.includes("revenue") && rawData.revenue) {
    exportData.sections.revenue = {
      total: rawData.revenue.totalRevenue,
      fromOffers: rawData.revenue.offersRevenue,
      fromAds: rawData.revenue.adsRevenue,
      conversionRate: rawData.revenue.conversionRate,
    };
  }

  if (sections.includes("offers") && rawData.offers) {
    exportData.sections.offers = {
      totalViews: rawData.offers.totalViews,
      totalPurchases: rawData.offers.totalPurchases,
      conversionRate: rawData.offers.conversionRate,
      averageOrderValue: rawData.offers.averageOrderValue || 0,
      topPerformers: rawData.offers.topPerformers,
    };
  }

  if (sections.includes("ads") && rawData.ads) {
    exportData.sections.ads = {
      totalImpressions: rawData.ads.totalImpressions,
      totalClicks: rawData.ads.totalClicks,
      averageCTR: rawData.ads.averageCTR,
      topPerformers: rawData.ads.topPerformers,
    };
  }

  if (sections.includes("waitlist") && rawData.waitlist) {
    exportData.sections.waitlist = {
      totalJoins: rawData.waitlist.totalJoins,
      offersIssued: rawData.waitlist.offersIssued,
      acceptanceRate: rawData.waitlist.acceptanceRate,
      averageWaitTimeMinutes: rawData.waitlist.averageWaitTimeMinutes,
    };
  }

  return exportData;
}
