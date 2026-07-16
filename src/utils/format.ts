// ── Formatting utilities ──

export function formatAmount(amount: string): string {
  if (!amount || amount === 'N/A' || amount === 'Unknown') return '—'
  // Already formatted like "$50,000" or "€10K"
  if (amount.startsWith('$') || amount.startsWith('€') || amount.startsWith('£')) {
    return amount
  }
  // Try to parse as number
  const num = parseInt(amount.replace(/[^0-9.]/g, ''), 10)
  if (isNaN(num)) return amount
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${num}`
}

export function daysLeftText(days: number | undefined | null): string {
  if (days === undefined || days === null) return 'No deadline'
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export function daysLeftColor(days: number | undefined | null): 'error' | 'warning' | 'success' | 'muted' {
  if (days === undefined || days === null) return 'muted'
  if (days <= 0) return 'error'
  if (days <= 7) return 'error'
  if (days <= 14) return 'warning'
  return 'success'
}

export function daysLeftThemeColor(
  days: number | undefined | null,
  colors: { error: string; warning: string },
  fallback: string,
): string {
  const state = daysLeftColor(days)
  if (state === 'error') return colors.error
  if (state === 'warning') return colors.warning
  return fallback
}

export function fitColor(fit: string | undefined): string {
  switch (fit?.toUpperCase()) {
    case 'HIGH': return '#22c55e'
    case 'AMBER': return '#f59e0b'
    case 'LOW': return '#6b7280'
    default: return '#6b7280'
  }
}

export function fitLabel(fit: string | undefined): string {
  switch (fit?.toUpperCase()) {
    case 'HIGH': return 'High'
    case 'AMBER': return 'Medium'
    case 'LOW': return 'Low'
    default: return 'Unknown'
  }
}

export function statusColor(status: string | undefined): string {
  switch (status?.toUpperCase()) {
    case 'OPEN': return '#22c55e'
    case 'CLOSED': return '#ef4444'
    case 'APPLIED': return '#3b82f6'
    case 'DRAFTING': return '#f59e0b'
    case 'SUBMITTED': return '#8b5cf6'
    case 'UNDER_REVIEW': return '#6366f1'
    case 'ACCEPTED': return '#22c55e'
    case 'REJECTED': return '#ef4444'
    default: return '#6b7280'
  }
}

export function statusLabel(status: string | undefined): string {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.substring(0, max - 1) + '…'
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`)
}
