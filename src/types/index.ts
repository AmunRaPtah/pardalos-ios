// ── Core GrantFinder types matching the Pardalos backend API ──

export interface Programme {
  id: string
  program: string
  provider: string
  type: string
  amount: string
  deadline_raw: string
  deadline_parsed: string | null
  status: string
  profile_fit: string
  track: string
  url: string
  days_left?: number
  applied_date?: string
  outcome?: string
  category?: string
}

export interface Notification {
  id: number
  created_at: string
  program_id: string | null
  event_type: 'draft_ready' | 'form_ready' | 'submitted' | 'error' | 'info'
  title: string
  body: string | null
  token: string | null
  action: string | null
  read: number
}

export interface PendingApproval {
  token: string
  program_id: string
  action: string
  context_json: string | null
  status: string
  created_at: string
  program_name: string | null
  deadline_raw: string | null
  amount: string | null
}

export interface DashboardData {
  stats: DashboardStats
  track_breakdown: Record<string, TrackBreakdown>
  timeline: UrgencyItem[]
  total_programs: number
}

export interface DashboardStats {
  total?: number
  actionable?: number
  enriched?: number
  scout_entries?: number
  high_fit?: number
  pending_review?: number
  error?: string
  [key: string]: any
}

export interface TrackBreakdown {
  total: number
  open: number
  applied: number
  high_fit: number
  drafted: number
  researched: number
  urgent: number
}

export interface UrgencyItem {
  id: string
  program: string
  days_left: number
  deadline: string | null
  fit: string
  track: string
  amount: string
  url: string
}

export interface GrowthReport {
  current: {
    total: number
    actionable: number
    enriched: number
    scout_entries: number
    high_fit: number
    new_last_7d: number
    avg_win_prob: number
  }
  growth_rates: {
    actionable_growth_pct: number
    enrichment_growth_pct: number
    weekly_actionable_rate_pct: number
    period_days: number
  }
  health_assessment: string
  snapshot_history: any[]
  weekly_growth: any[]
}

export interface ProgramDetail {
  id: string
  program: string
  provider: string
  type: string
  amount: string
  deadline_raw: string
  deadline_parsed: string | null
  status: string
  profile_fit: string
  track: string
  url: string
  days_left?: number
  applied_date?: string
  outcome?: string
  category?: string
  classifications?: any[]
  research?: any
  draft?: any
  documents?: any[]
}

export interface ApplicationItem {
  id: string
  program: string
  provider: string | null
  applied_date: string | null
  outcome: string | null
  status: string
  track: string
  amount: string
  url: string
}

export interface SubmissionPending {
  program_id: string
  program_name: string
  url: string
  state: string
  submitted_at: string | null
  error: string | null
  run_count: number
}

export interface SubmissionCompleted {
  program_id: string
  program_name: string
  state: string
  submitted_at: string
  confirmation: string
}

export interface SubmissionStatus {
  pending: SubmissionPending[]
  completed: SubmissionCompleted[]
}

export interface TrackerStatus {
  states?: string[]
  transitions?: Record<string, string[]>
  status?: string
}

export interface AutomationStatus {
  grantfinder: any
  stats: any
  last_alert: any
}

export interface HygieneReport {
  total_issues_logged: number
  issue_distribution: Record<string, number>
  trend: string
  severity_breakdown: { high: number; medium: number; low: number }
  cleanliness_score: string
  recommendations: string[]
}

export interface FormField {
  tag: string
  type: string
  name: string
  id: string
  label: string
  placeholder: string
  required: boolean
  value: string
  options?: { value: string; text: string }[]
}
