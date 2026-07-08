import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

interface StatCardProps {
  label: string
  value: number | string
  color?: string
  icon?: string
  subtitle?: string
}

export function StatCard({ label, value, color, icon, subtitle }: StatCardProps) {
  const theme = useTheme()
  const colors = theme.colors

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: color || colors.text }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
})
