/**
 * Export Utility for Intervention Reports
 *
 * Provides functions to export intervention data as CSV or JSON.
 */

export interface InterventionRecord {
  timestamp: string;
  type: string;
  confidence: number;
  status: string;
  reasoning: string;
  engagementBefore?: number;
  engagementAfter?: number;
  engagementDelta?: string;
  generationMethod?: string;
  latency?: number;
}

/**
 * Export interventions as CSV
 */
export function exportInterventionsAsCSV(interventions: InterventionRecord[]): void {
  if (interventions.length === 0) {
    alert('No interventions to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Timestamp',
    'Type',
    'Confidence',
    'Status',
    'Reasoning',
    'Engagement Before',
    'Engagement After',
    'Engagement Delta',
    'Generation Method',
    'Latency (ms)'
  ];

  // Convert interventions to CSV rows
  const rows = interventions.map(intervention => [
    intervention.timestamp,
    intervention.type,
    intervention.confidence.toFixed(2),
    intervention.status,
    `"${intervention.reasoning.replace(/"/g, '""')}"`, // Escape quotes
    intervention.engagementBefore?.toFixed(1) || 'N/A',
    intervention.engagementAfter?.toFixed(1) || 'N/A',
    intervention.engagementDelta || 'N/A',
    intervention.generationMethod || 'N/A',
    intervention.latency?.toString() || 'N/A'
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and download file
  downloadFile(csvContent, 'intervention-report.csv', 'text/csv');
}

/**
 * Export interventions as JSON
 */
export function exportInterventionsAsJSON(interventions: InterventionRecord[]): void {
  if (interventions.length === 0) {
    alert('No interventions to export');
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    totalInterventions: interventions.length,
    interventions: interventions,
    summary: generateSummary(interventions)
  };

  const jsonContent = JSON.stringify(exportData, null, 2);

  downloadFile(jsonContent, 'intervention-report.json', 'application/json');
}

/**
 * Generate summary statistics
 */
function generateSummary(interventions: InterventionRecord[]) {
  const total = interventions.length;
  const byType = interventions.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byStatus = interventions.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgConfidence =
    interventions.reduce((sum, i) => sum + i.confidence, 0) / total;

  const successCount = interventions.filter(
    i => i.status === 'SUCCESS' || i.status === 'EXECUTED'
  ).length;

  const successRate = total > 0 ? (successCount / total) * 100 : 0;

  return {
    totalInterventions: total,
    interventionsByType: byType,
    interventionsByStatus: byStatus,
    averageConfidence: avgConfidence.toFixed(2),
    successRate: successRate.toFixed(1) + '%',
    successCount
  };
}

/**
 * Download file to user's device
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Copy interventions to clipboard as formatted text
 */
export function copyInterventionsToClipboard(interventions: InterventionRecord[]): Promise<void> {
  if (interventions.length === 0) {
    return Promise.reject('No interventions to copy');
  }

  const summary = generateSummary(interventions);

  const text = `
INTERVENTION REPORT
===================

Export Date: ${new Date().toISOString()}
Total Interventions: ${summary.totalInterventions}
Success Rate: ${summary.successRate}
Average Confidence: ${summary.averageConfidence}

Interventions by Type:
${Object.entries(summary.interventionsByType)
  .map(([type, count]) => `  - ${type}: ${count}`)
  .join('\n')}

Interventions by Status:
${Object.entries(summary.interventionsByStatus)
  .map(([status, count]) => `  - ${status}: ${count}`)
  .join('\n')}

Recent Interventions:
${interventions
  .slice(-5)
  .reverse()
  .map(
    (i, idx) => `
${idx + 1}. ${i.type} - ${i.status}
   Time: ${new Date(i.timestamp).toLocaleString()}
   Confidence: ${(i.confidence * 100).toFixed(0)}%
   ${i.engagementDelta ? `Impact: ${i.engagementDelta}` : ''}
`
  )
  .join('\n')}
`.trim();

  return navigator.clipboard.writeText(text);
}
