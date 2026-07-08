import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

interface LoadingStateProps {
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  message?: string
}

export function LoadingState({ loading, error, onRetry, message }: LoadingStateProps) {
  const theme = useTheme()
  const colors = theme.colors

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        )}
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorIcon]}>⚠️</Text>
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Connection Error
        </Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
