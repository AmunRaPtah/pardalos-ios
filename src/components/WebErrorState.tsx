// ── Full-screen error state for the Pardalos WebView ──

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

interface WebErrorStateProps {
  /** Error description from the WebView. */
  error: string
  /** Called when the user taps "Retry". */
  onRetry: () => void
  /** Called when the user taps "Check Settings". */
  onSettings: () => void
}

export function WebErrorState({ error, onRetry, onSettings }: WebErrorStateProps) {
  const theme = useTheme()
  const colors = theme.colors

  const isConnectionError =
    error.toLowerCase().includes('network') ||
    error.toLowerCase().includes('timeout') ||
    error.toLowerCase().includes('dns') ||
    error.toLowerCase().includes('connection') ||
    error.toLowerCase().includes('could not connect')

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.iconText, { color: colors.error }]}>!</Text>
        </View>

        {/* Heading */}
        <Text style={[styles.title, { color: colors.text }]}>
          {isConnectionError ? 'Could Not Connect' : 'Something Went Wrong'}
        </Text>

        {/* Detail */}
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {isConnectionError
            ? 'Unable to reach your Pardalos server. Make sure it is running and accessible from this device.'
            : error}
        </Text>

        {/* Retry */}
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={[styles.settingsButton, { borderColor: colors.border }]}
          onPress={onSettings}
          activeOpacity={0.7}
        >
          <Text style={[styles.settingsText, { color: colors.text }]}>
            Check Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 320,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 28,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  settingsButton: {
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
