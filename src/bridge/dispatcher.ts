// ── Route incoming WebView messages to native handlers ──

import type { WebView } from 'react-native-webview'
import { Linking, Clipboard, Platform, Vibration } from 'react-native'
import * as Sharing from 'expo-sharing'
import { Paths, File } from 'expo-file-system'
import { respondToWeb } from './sender'
import type { BridgeMessage } from './types'
import { getServerUrl } from '@/api/client'

/** Callbacks the dispatcher needs from the caller. */
export interface DispatcherContext {
  navigation: any
  webView: React.RefObject<WebView>
}

/**
 * Handle a single bridge message received from the WebView.
 * Returns `true` if the message was recognised, `false` otherwise.
 */
export async function dispatchBridgeMessage(
  message: BridgeMessage,
  ctx: DispatcherContext,
): Promise<boolean> {
  const { navigation, webView } = ctx
  const p = message.payload || {}

  switch (message.type) {
    // ── Screen navigation ───────────────────────────────────────
    case 'openNativeScreen': {
      const screen = p.screen as string
      const params = p.params as Record<string, unknown> | undefined
      if (screen) {
        // Check if it's a tab name
        const tabName = `${screen}Tab`
        // Try navigating to the exact route, then try with Tab suffix
        try {
          navigation.navigate(screen, params)
        } catch {
          try {
            navigation.navigate(tabName, params ? { screen: params.screen, params } : undefined)
          } catch {
            // Silently ignore unknown routes
          }
        }
      }
      return true
    }

    case 'openGrantDashboard': {
      navigation.navigate('DashboardTab')
      return true
    }

    case 'openGrantApplications': {
      navigation.navigate('ApplicationsTab')
      return true
    }

    case 'openGrantProgram': {
      const programId = p.programId as string
      if (programId) {
        navigation.navigate('ProgramsTab', {
          screen: 'ProgramDetail',
          params: { programId },
        })
      }
      return true
    }

    // ── File operations ─────────────────────────────────────────
    case 'shareFile': {
      const uri = p.uri as string
      const mimeType = (p.mimeType as string) || 'application/octet-stream'
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, { mimeType })
      }
      if (message.id) {
        respondToWeb(webView, message.id, { shared: true })
      }
      return true
    }

    case 'saveFile': {
      const url = p.url as string
      const fileName = (p.fileName as string) || 'download'
      if (url) {
        const destFile = new File(Paths.cache, fileName)
        const downloaded = await File.downloadFileAsync(url, destFile)
        if (message.id) {
          respondToWeb(webView, message.id, { path: downloaded.uri })
        }
      }
      return true
    }

    // ── URL / clipboard / haptics ────────────────────────────────
    case 'openUrl': {
      const url = p.url as string
      if (url) {
        const supported = await Linking.canOpenURL(url)
        if (supported) await Linking.openURL(url)
      }
      return true
    }

    case 'copyToClipboard': {
      const text = p.text as string
      if (text) Clipboard.setString(text)
      if (message.id) respondToWeb(webView, message.id, { copied: true })
      return true
    }

    case 'hapticFeedback': {
      if (Platform.OS === 'ios') {
        const style = p.style as string
        // Light = 30ms, Medium = 50ms, Heavy = 100ms
        let ms = 50
        if (style === 'light') ms = 30
        else if (style === 'heavy') ms = 100
        Vibration.vibrate(ms)
      }
      if (message.id) respondToWeb(webView, message.id, { hapticked: true })
      return true
    }

    // ── Info queries ────────────────────────────────────────────
    case 'getServerUrl': {
      const url = await getServerUrl()
      if (message.id) respondToWeb(webView, message.id, { url })
      return true
    }

    case 'getAppInfo': {
      if (message.id) {
        respondToWeb(webView, message.id, {
          platform: Platform.OS,
          version: '1.1.0',
          buildNumber: '2',
          bridgeVersion: '1.0.0',
        })
      }
      return true
    }

    default:
      return false
  }
}
