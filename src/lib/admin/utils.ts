// src/lib/admin/utils.ts
// Shared utility helpers for all admin panel pages

/**
 * Formats an ISO timestamp string into a short, human-readable date.
 * Example: "Aug 27, 2026"
 */
export function formatDate(ts: string): string {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Returns a Tailwind text color class based on a score value.
 * Green for ≥80, Amber for ≥60, Red for below 60.
 */
export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

/**
 * Returns a Tailwind background color class based on a score value.
 * Green for ≥80, Amber for ≥60, Red for below 60.
 */
export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-500/10';
  if (score >= 60) return 'bg-amber-50 dark:bg-amber-500/10';
  return 'bg-red-50 dark:bg-red-500/10';
}

/**
 * Returns a human-readable relative time string (e.g., "5m ago", "3h ago", "2d ago").
 */
export function timeAgo(ts: string): string {
  if (!ts) return 'Never';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/**
 * Formats seconds into a human-readable duration string (e.g., "5m 30s").
 */
export function formatDuration(seconds: number): string {
  if (!seconds) return '0m 0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/**
 * Triggers a browser download of JSON array data converted to CSV format.
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
