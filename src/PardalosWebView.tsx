// ── Full-screen WebView that loads the Pardalos web UI from the server ──
// The web app handles its own responsive layout (sidebar, mobile bottom nav, icons).
// This native shell does nothing but host the WebView — the web UI IS the app.

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native'
import { WebView, type WebViewNavigation } from 'react-native-webview'
import { CONFIG } from './config'

export function PardalosWebView() {
  const webRef = useRef<WebView>(null)
  const [key, setKey] = useState(0)

  // Reload when coming back to foreground to sync any server-side changes
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        // Small delay to let the network wake
        setTimeout(() => webRef.current?.reload(), 100)
      }
    })
    return () => sub.remove()
  }, [])

  // Only allow navigation to the configured server or local file:// (for debugging)
  const onShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation) => {
      if (request.url.startsWith('file://')) return true
      return request.url.startsWith(CONFIG.serverUrl)
    },
    [],
  )

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        key={key}
        source={{ uri: CONFIG.serverUrl }}
        style={styles.webView}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setBuiltInZoomControls={false}
        overScrollMode="never"
        bounces={false}
        pullToRefreshEnabled={false}
        allowsBackForwardNavigationGestures
        decelerationRate="normal"
        hideKeyboardAccessoryView={false}
        userAgent={
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Pardalos-iOS/1.0'
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010103',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})
