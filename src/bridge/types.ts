// ── Native ↔ Web bridge message protocol ──

/** Every message exchanged across the bridge follows this shape. */
export interface BridgeMessage {
  /** Discriminator — tells the receiver what to do with this message. */
  type: BridgeMessageType

  /** Arbitrary data scoped to the message type. */
  payload?: Record<string, unknown>

  /**
   * Correlation id for request/response pairs.
   * The sender sets it, the receiver echoes it back so the sender can
   * resolve the right promise.
   */
  id?: string
}

/** All recognised bridge message types. */
export type BridgeMessageType =
  // ── Native → Web ────────────────────────────────────────────────
  /** The user changed the server URL in Settings — web app should reload. */
  | 'serverUrlChanged'
  /** System colour-scheme changed (dark / light). */
  | 'themeChanged'
  /** APNs push-token (or nil) arrived. */
  | 'pushToken'
  /** The device went online / offline. */
  | 'connectivityChanged'
  /** A file was shared into the app from another app. */
  | 'fileShared'
  /** App entered foreground / background. */
  | 'appStateChanged'

  // ── Web → Native ────────────────────────────────────────────────
  /** Navigate the native shell to an arbitrary screen. */
  | 'openNativeScreen'
  /** Show the native share-sheet for a file. */
  | 'shareFile'
  /** Save a remote file to the device's local storage. */
  | 'saveFile'
  /** Return the currently-configured server URL. */
  | 'getServerUrl'
  /** Return the APNs push token (or null). */
  | 'getPushToken'
  /** Open a URL in the system browser. */
  | 'openUrl'
  /** Copy a string to the system clipboard. */
  | 'copyToClipboard'
  /** Trigger a haptic feedback tap. */
  | 'hapticFeedback'
  /** Return app version, build info. */
  | 'getAppInfo'

  // ── Web → Native (deep-link into native Grant-Finder tabs) ─────
  /** Open the native ProgramDetail screen for the given grant. */
  | 'openGrantProgram'
  /** Switch to the native Dashboard tab. */
  | 'openGrantDashboard'
  /** Switch to the native Applications tab. */
  | 'openGrantApplications'

// ── Helpers ────────────────────────────────────────────────────────

/** Create a message to send *to* the WebView. */
export function nativeMsg(
  type: BridgeMessage['type'],
  payload?: Record<string, unknown>,
): BridgeMessage {
  return { type, payload }
}

/** Create a response to a previous request from the WebView. */
export function responseMsg(
  request: BridgeMessage,
  payload: Record<string, unknown>,
): BridgeMessage {
  return { type: request.type, payload, id: request.id }
}
