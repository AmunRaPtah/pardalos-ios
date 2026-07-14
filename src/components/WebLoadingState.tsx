// ── Animated loading overlay for the Pardalos WebView ──

import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

interface WebLoadingStateProps {
  /** Progress value 0–1 from the WebView's onLoadProgress. */
  progress: number
  /** Optional custom message. */
  message?: string
}

export function WebLoadingState({ progress, message }: WebLoadingStateProps) {
  const theme = useTheme()
  const colors = theme.colors
  const widthAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 120,
      useNativeDriver: false,
    }).start()
  }, [progress, widthAnim])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {message || 'Loading Pardalos…'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Connecting to your server
        </Text>

        <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
          <Animated.View
            style={[
              styles.bar,
              {
                backgroundColor: '#6366f1',
                width: widthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <Text style={[styles.percent, { color: colors.textMuted }]}>
          {Math.round(progress * 100)}%
        </Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 28,
  },
  track: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  percent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
})
