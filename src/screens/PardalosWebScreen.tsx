// ── Full Pardalos web app loaded from local bundle ──

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
import * as FileSystem from 'expo-file-system/legacy'
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

/** Path to the bundled web app inside the .app bundle */
const WEB_ASSETS_PATH = FileSystem.bundleDirectory + 'web/'
const WEB_INDEX_PATH = WEB_ASSETS_PATH + 'index.html'

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
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [htmlError, setHtmlError] = useState<string | null>(null)

  // Register this WebView ref with the bridge context
  useEffect(() => {
    registerWebView(webRef)
  }, [registerWebView])

  // ── Load the bundled index.html on mount ────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        // Check if the web assets exist in the bundle first
        const dirInfo = await FileSystem.getInfoAsync(WEB_ASSETS_PATH)
        if (!dirInfo.exists) {
          setHtmlError(`Web assets not found at ${WEB_ASSETS_PATH}`)
          return
        }
        const html = await FileSystem.readAsStringAsync(WEB_INDEX_PATH)
        if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
          setHtmlError('index.html does not contain valid HTML')
          return
        }
        setHtmlContent(html)
      } catch (err: any) {
        console.error('Failed to load bundled web app:', err)
        setHtmlError(`Failed to load web app: ${err.message || err}`)
      }
    })()
  }, [])

  // ── Build the server URL for API calls ──────────────────────────
  const apiServerUrl = useMemo(() => {
    return (serverUrl || CONFIG.defaultServerUrl).replace(/\/+$/, '')
  }, [serverUrl])

  // ── JavaScript injected BEFORE content loads ────────────────────
  const injectionScript = useMemo(() => {
    return `
      // Tell the SPA to use the configured API server
      window.__PARDALOS_API_URL__ = '${apiServerUrl}/api';
      window.__PARDALOS_MODE__ = 'hybrid';

      // Fix for Vite-SPA boot: ensure base path is correct for file:// loading
      document.currentScript && document.currentScript.remove();

      // Forward connectivity state
      window.__PARDALOS_CONNECTED__ = ${isConnected};

      ${getBridgeInjectionScript()}
    `
  }, [apiServerUrl, isConnected])

  // ── Build the WebView source ────────────────────────────────────
  const webViewSource = useMemo(() => {
    if (!htmlContent) return undefined
    return {
      html: htmlContent,
      baseUrl: WEB_ASSETS_PATH,
    }
  }, [htmlContent])

  // ── Periodic connectivity check ─────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await checkConnection()
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
      // Allow file:// (local assets) and the configured server
      if (request.url.startsWith('file://')) return true
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

      {/* WebView or error state */}
      <View style={styles.webViewContainer}>
        {htmlError ? (
          <WebErrorState
            error={htmlError}
            onRetry={handleRetry}
            onSettings={handleSettings}
          />
        ) : htmlContent && webViewSource ? (
          <WebView
            ref={webRef}
            source={webViewSource}
            style={styles.webView}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onLoadProgress={handleLoadProgress}
            onError={handleError}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={onMessage}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            injectedJavaScriptBeforeContentLoaded={injectionScript}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
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
        ) : null}

        {/* Loading overlay */}
        {loadState === 'loading' && htmlContent && (
          <WebLoadingState progress={loadProgress} />
        )}

        {/* Error overlay for WebView load errors */}
        {loadState === 'error' && loadError && htmlContent && (
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
