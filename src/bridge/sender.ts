// ── Send messages from native code into the WebView ──

import type { WebView } from 'react-native-webview'
import type { BridgeMessage } from './types'

/**
 * Send an unsolicited message into the WebView.
 * The web app receives it as a `pardalos:<type>` CustomEvent on `window`.
 */
export function sendMessageToWeb(
  webView: React.RefObject<WebView>,
  message: BridgeMessage,
): void {
  const js = `;(function(){
    window.dispatchEvent(new CustomEvent('pardalos-bridge-message', {
      detail: ${JSON.stringify(message)}
    }));
  })();`
  webView.current?.injectJavaScript(js)
}

/**
 * Send a response to a prior request from the WebView.
 */
export function respondToWeb(
  webView: React.RefObject<WebView>,
  messageId: string,
  payload: Record<string, unknown>,
): void {
  const js = `;(function(){
    window.dispatchEvent(new CustomEvent('pardalos-bridge-response', {
      detail: ${JSON.stringify({ id: messageId, payload })}
    }));
  })();`
  webView.current?.injectJavaScript(js)
}

/**
 * Send the current theme to the web app so it can match the native chrome.
 */
export function sendThemeToWeb(
  webView: React.RefObject<WebView>,
  isDark: boolean,
): void {
  sendMessageToWeb(webView, {
    type: 'themeChanged',
    payload: { theme: isDark ? 'dark' : 'light' },
  })
}

/**
 * Send a connectivity status update to the web app.
 */
export function sendConnectivityToWeb(
  webView: React.RefObject<WebView>,
  isConnected: boolean,
): void {
  sendMessageToWeb(webView, {
    type: 'connectivityChanged',
    payload: { connected: isConnected },
  })
}
