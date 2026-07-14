// ── In-app browser ──
// A lightweight WebView browser with URL bar + navigation controls.
// Defaults to the configured Pardalos server's shared (Neko) browser at /browser,
// so you can watch/drive the same browser the agent uses — but you can navigate anywhere.

import React, { useMemo, useRef, useState, useCallback } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { useTheme } from '@/hooks/useTheme'
import { useServerConfig } from '@/hooks/useServerConfig'

function normalizeUrl(input: string): string {
  const t = input.trim()
  if (!t) return t
  if (/^https?:\/\//i.test(t)) return t
  // Looks like a domain (has a dot, no spaces) -> assume https, else search.
  if (/^[^\s]+\.[^\s]+$/.test(t)) return `https://${t}`
  return `https://duckduckgo.com/?q=${encodeURIComponent(t)}`
}

export function BrowserScreen() {
  const theme = useTheme()
  const colors = theme.colors
  const { url: serverUrl } = useServerConfig()

  const homeUrl = useMemo(() => {
    const base = (serverUrl || 'https://pardalos.zyco.org').replace(/\/+$/, '')
    return `${base}/browser`
  }, [serverUrl])

  const webRef = useRef<WebView>(null)
  const [currentUrl, setCurrentUrl] = useState(homeUrl)
  const [addressText, setAddressText] = useState(homeUrl)
  const [loading, setLoading] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  const go = useCallback((raw: string) => {
    const next = normalizeUrl(raw)
    if (!next) return
    setCurrentUrl(next)
    setAddressText(next)
  }, [])

  const styles = useMemo(() => makeStyles(colors, theme), [colors, theme])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Address bar */}
        <View style={styles.bar}>
          <TextInput
            style={styles.address}
            value={addressText}
            onChangeText={setAddressText}
            onSubmitEditing={e => go(e.nativeEvent.text)}
            placeholder="Search or enter address"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            selectTextOnFocus
          />
          <TouchableOpacity style={styles.homeBtn} onPress={() => go(homeUrl)}>
            <Text style={styles.homeIcon}>🏠</Text>
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <View style={styles.flex}>
          <WebView
            ref={webRef}
            source={{ uri: currentUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={nav => {
              setCanGoBack(nav.canGoBack)
              setCanGoForward(nav.canGoForward)
              if (nav.url) setAddressText(nav.url)
            }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled
            javaScriptEnabled
            originWhitelist={['*']}
            style={{ backgroundColor: colors.background }}
          />
          {loading && (
            <View style={styles.spinner} pointerEvents="none">
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </View>

        {/* Nav controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.ctrlBtn}
            disabled={!canGoBack}
            onPress={() => webRef.current?.goBack()}
          >
            <Text style={[styles.ctrlIcon, !canGoBack && styles.ctrlDisabled]}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctrlBtn}
            disabled={!canGoForward}
            onPress={() => webRef.current?.goForward()}
          >
            <Text style={[styles.ctrlIcon, !canGoForward && styles.ctrlDisabled]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} onPress={() => webRef.current?.reload()}>
            <Text style={styles.ctrlIcon}>⟳</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} onPress={() => go(homeUrl)}>
            <Text style={styles.ctrlIconSm}>Pardalos</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function makeStyles(colors: any, theme: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      gap: theme.spacing.sm,
    },
    address: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      color: colors.text,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
      fontSize: theme.fontSize.sm,
    },
    homeBtn: { padding: 6 },
    homeIcon: { fontSize: 20 },
    spinner: { position: 'absolute', top: 10, right: 14 },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      paddingVertical: theme.spacing.sm,
    },
    ctrlBtn: { paddingHorizontal: theme.spacing.lg, paddingVertical: 4 },
    ctrlIcon: { fontSize: 28, color: colors.primary, fontWeight: '600' },
    ctrlIconSm: { fontSize: theme.fontSize.sm, color: colors.primary, fontWeight: '700' },
    ctrlDisabled: { color: colors.textMuted, opacity: 0.4 },
  })
}
