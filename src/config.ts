// ── Pardalos iOS app configuration ──

export const CONFIG = {
  /** Default server URL if none has been configured yet. */
  defaultServerUrl: 'https://pardalos.zyco.org',

  /** User-agent suffix so the server can identify WebView traffic. */
  webViewUserAgent: 'Pardalos-iOS/1.0',

  /** Bridge protocol version — bump when the message schema changes. */
  bridgeVersion: '1.0.0',

  /** How long (ms) between connectivity health-check pings. */
  healthCheckIntervalMs: 30_000,

  /** Progress-bar colour (indigo-500). */
  progressBarColor: '#6366f1',

  /** How long to wait before treating a WebView load as stalled (ms). */
  loadTimeoutMs: 15_000,
} as const
