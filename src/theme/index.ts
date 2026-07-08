// ── Pardalos iOS theme ──
// Dark-first design with light mode support

export const palette = {
  // Primary
  primary: '#6366f1',        // Indigo-500
  primaryLight: '#818cf8',   // Indigo-400
  primaryDark: '#4f46e5',    // Indigo-600

  // Semantic
  success: '#22c55e',        // Green-500
  warning: '#f59e0b',        // Amber-500
  error: '#ef4444',          // Red-500
  info: '#3b82f6',           // Blue-500

  // Fit scores
  fitHigh: '#22c55e',
  fitAmber: '#f59e0b',
  fitLow: '#6b7280',

  // Buttons
  buttonPrimary: '#6366f1',
  buttonDanger: '#ef4444',
} as const

export const darkTheme = {
  dark: true,
  colors: {
    background: '#0f0f1a',
    surface: '#1a1a2e',
    surfaceAlt: '#232340',
    card: '#1e1e32',
    text: '#f1f1f6',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    border: '#2a2a45',
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
    tabBar: '#1a1a2e',
    tabBarActive: palette.primary,
    tabBarInactive: '#6b7280',
    statusBar: 'light' as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 34,
  },
}

export const lightTheme = {
  dark: false,
  colors: {
    background: '#f8f9ff',
    surface: '#ffffff',
    surfaceAlt: '#f0f1fe',
    card: '#ffffff',
    text: '#1a1a2e',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
    tabBar: '#ffffff',
    tabBarActive: palette.primary,
    tabBarInactive: '#9ca3af',
    statusBar: 'dark' as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 34,
  },
}

export type AppTheme = typeof darkTheme
