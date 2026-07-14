// ── React context for the native ↔ WebView bridge ──

import React, { createContext, useContext, useRef, useCallback } from 'react'
import type { WebView } from 'react-native-webview'
import type { BridgeMessage } from './types'
import { dispatchBridgeMessage } from './dispatcher'
import { sendMessageToWeb } from './sender'

interface BridgeContextValue {
  /** Register a WebView ref so the bridge can talk to it. */
  registerWebView: (ref: React.RefObject<WebView>) => void

  /** Send a message into the currently-registered WebView. */
  sendToWeb: (message: BridgeMessage) => void

  /** Handle an incoming message from the WebView. */
  handleWebMessage: (event: any, navigation: any) => Promise<boolean>
}

const BridgeContext = createContext<BridgeContextValue | null>(null)

export function BridgeProvider({ children }: { children: React.ReactNode }) {
  const webViewRef = useRef<React.RefObject<WebView> | null>(null)

  const registerWebView = useCallback((ref: React.RefObject<WebView>) => {
    webViewRef.current = ref
  }, [])

  const sendToWeb = useCallback((message: BridgeMessage) => {
    if (webViewRef.current) {
      // We send via the ref stored in the context
      const js = `;(function(){
        window.dispatchEvent(new CustomEvent('pardalos-bridge-message', {
          detail: ${JSON.stringify(message)}
        }));
      })();`
      webViewRef.current.current?.injectJavaScript(js)
    }
  }, [])

  const handleWebMessage = useCallback(
    async (event: any, navigation: any): Promise<boolean> => {
      try {
        const message: BridgeMessage =
          typeof event === 'string' ? JSON.parse(event) : event.nativeEvent?.data
            ? JSON.parse(event.nativeEvent.data)
            : event

        if (!webViewRef.current) {
          return false
        }
        return await dispatchBridgeMessage(message, {
          navigation,
          webView: webViewRef.current,
        })
      } catch {
        return false
      }
    },
    [],
  )

  return (
    <BridgeContext.Provider value={{ registerWebView, sendToWeb, handleWebMessage }}>
      {children}
    </BridgeContext.Provider>
  )
}

export function useBridge(): BridgeContextValue {
  const ctx = useContext(BridgeContext)
  if (!ctx) throw new Error('useBridge must be used inside <BridgeProvider>')
  return ctx
}
