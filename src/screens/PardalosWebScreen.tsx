// ── Full Pardalos web app in a managed WebView ──

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
  AppStateStatus,
} from 'react-native'
import { WebView, type WebViewNavigation } from 'react-native-webview'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { useTheme } from '@/hooks/useTheme'
import { useServerConfig } from '@/hooks/useServerConfig'
import { useBridge } from '@/bridge/BridgeContext'
import { getBridgeInjectionScript } from '@/bridge/webview-bridge'
import { sendConnectivityToWeb } from '@/bridge/sender'
import { WebLoadingState } from '@/components/WebLoadingState'
import { WebErrorState } from '@/components/WebErrorState'
import { CONFIG } from '@/config'

type LoadState = 'loading' | 'success' | 'error'

export function PardalosWebScreen() {
  const theme = useTheme()
  const colors = theme.colors
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const { url: serverUrl, checkConnection } = useServerConfig()
  const { registerWebView, handleWebMessage } = useBridge()

  const webRef = useRef<WebView>(null) as React.RefObject<WebView>
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)

  // Register this WebView ref with the bridge context
  useEffect(() => {
    registerWebView(webRef)
  }, [registerWebView])

  // ── Build the URL to load ──────────────────────────────────────
  const homeUrl = useMemo(() => {
    const base = (serverUrl || CONFIG.defaultServerUrl).replace(/\/+$/, '')
    return base + '/'
  }, [serverUrl])

  // ── Periodic connectivity check ─────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await checkConnection()
        // checkConnection is void — we just check if the network is there
        setIsConnected(true)
        setShowOfflineBanner(false)
      } catch {
        setIsConnected(false)
        setShowOfflineBanner(true)
      }
    }, CONFIG.healthCheckIntervalMs)

    return () => clearInterval(interval)
  }, [checkConnection])

  // ── Monitor app state (foreground / background) ─────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        // Refresh connectivity check when coming to foreground
        checkConnection()
      }
    })
    return () => sub.remove()
  }, [checkConnection])

  // ── Back button (header) ────────────────────────────────────────
  const handleGoBack = useCallback(() => {
    if (canGoBack && webRef.current) {
      webRef.current.goBack()
    }
  }, [canGoBack])

  // ── WebView event handlers ─────────────────────────────────────
  const handleLoadStart = useCallback(() => {
    setLoadState('loading')
    setLoadError(null)
    setLoadProgress(0)
  }, [])

  const handleLoadEnd = useCallback(() => {
    setLoadState('success')
    setLoadProgress(1)
  }, [])

  const handleLoadProgress = useCallback((event: { nativeEvent: { progress: number } }) => {
    setLoadProgress(event.nativeEvent.progress)
  }, [])

  const handleError = useCallback(
    (event: { nativeEvent: { description: string; code: number } }) => {
      setLoadState('error')
      setLoadError(event.nativeEvent.description || `Error code ${event.nativeEvent.code}`)
    },
    [],
  )

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack)
    },
    [],
  )

  // ── Bridge message handler ─────────────────────────────────────
  const onMessage = useCallback(
    async (event: any) => {
      await handleWebMessage(event, navigation)
    },
    [handleWebMessage, navigation],
  )

  // ── Error screen actions ───────────────────────────────────────
  const handleRetry = useCallback(() => {
    setLoadState('loading')
    setLoadError(null)
    setLoadProgress(0)
    webRef.current?.reload()
  }, [])

  const handleSettings = useCallback(() => {
    navigation.navigate('SettingsTab' as never)
  }, [navigation])

  // ── Only allow navigation to the configured server ──────────────
  const onShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation) => {
      // Allow the home URL and any sub-paths on the same origin
      const base = (serverUrl || CONFIG.defaultServerUrl).replace(/\/+$/, '')
      return request.url.startsWith(base)
    },
    [serverUrl],
  )

  // ── Render ─────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Navigation bar */}
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleGoBack}
          disabled={!canGoBack}
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          activeOpacity={0.6}
        >
          <Text
            style={[
              styles.navButtonText,
              { color: canGoBack ? colors.text : colors.textMuted },
            ]}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        <Text
          style={[styles.navTitle, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          Pardalos
        </Text>

        <TouchableOpacity
          onPress={() => webRef.current?.reload()}
          style={styles.navButton}
          activeOpacity={0.6}
        >
          <Text style={[styles.navButtonText, { color: colors.primary }]}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Offline banner */}
      {showOfflineBanner && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.warning }]}>
          <Text style={styles.offlineBannerText}>Connection lost — retrying…</Text>
        </View>
      )}

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webRef}
          key={homeUrl} // Force remount when URL changes
          source={{ uri: homeUrl }}
          style={styles.webView}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoadProgress={handleLoadProgress}
          onError={handleError}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          injectedJavaScript={getBridgeInjectionScript()}
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
          userAgent={`Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ${CONFIG.webViewUserAgent}`}
        />

        {/* Loading overlay */}
        {loadState === 'loading' && (
          <WebLoadingState progress={loadProgress} />
        )}

        {/* Error overlay */}
        {loadState === 'error' && loadError && (
          <WebErrorState
            error={loadError}
            onRetry={handleRetry}
            onSettings={handleSettings}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navButton: { padding: 8, minWidth: 60 },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { fontSize: 16, fontWeight: '600' },
  navTitle: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  offlineBanner: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  webViewContainer: { flex: 1, position: 'relative' },
  webView: { flex: 1, backgroundColor: 'transparent' },
})
