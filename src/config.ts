// ── Pardalos iOS app configuration ──
// The entire app is a single WebView that loads the Pardalos web UI.
// No native navigation, no native tabs — the web app IS the UI.

export const CONFIG = {
  /** Pardalos server URL — the web app is served here. */
  serverUrl: 'https://pardalos.zyco.org',
} as const
