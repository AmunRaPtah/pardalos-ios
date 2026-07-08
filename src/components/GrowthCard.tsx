import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import type { GrowthReport } from '@/types'

interface GrowthCardProps {
  growth: GrowthReport | null
}

export function GrowthCard({ growth }: GrowthCardProps) {
  const theme = useTheme()
  const colors = theme.colors

  if (!growth) return null

  const { current, growth_rates, health_assessment } = growth
  const isHealthy = health_assessment?.toLowerCase().includes('healthy')
  const healthColor = isHealthy ? colors.success : colors.warning

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Growth</Text>

      <View style={styles.healthRow}>
        <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
        <Text style={[styles.healthText, { color: colors.textSecondary }]}>
          {health_assessment || 'Unknown'}
        </Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {current.actionable}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Actionable</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {current.enriched}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Enriched</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: growth_rates.actionable_growth_pct >= 0 ? colors.success : colors.error }]}>
            {growth_rates.actionable_growth_pct >= 0 ? '+' : ''}{growth_rates.actionable_growth_pct.toFixed(1)}%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Growth</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {current.new_last_7d}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>New (7d)</Text>
        </View>
      </View>

      <View style={styles.extraRow}>
        <Text style={[styles.extraText, { color: colors.textMuted }]}>
          {current.total} total · {current.high_fit} high-fit · {current.scout_entries} scout
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthText: {
    fontSize: 13,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  extraRow: {
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
  },
  extraText: {
    fontSize: 12,
    textAlign: 'center',
  },
})
