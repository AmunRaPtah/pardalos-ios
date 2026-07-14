import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import type { Programme } from '@/types'
import { daysLeftText, daysLeftThemeColor, formatAmount, fitColor, fitLabel, statusColor, statusLabel } from '@/utils/format'

interface ProgramRowProps {
  program: Programme
  onPress: (id: string) => void
}

export function ProgramRow({ program, onPress }: ProgramRowProps) {
  const theme = useTheme()
  const colors = theme.colors
  const urgent = program.days_left !== undefined && program.days_left <= 14

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: urgent ? colors.warning + '40' : colors.border,
          borderLeftColor: fitColor(program.profile_fit),
        },
      ]}
      onPress={() => onPress(program.id)}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {program.program}
          </Text>
          {program.provider && (
            <Text style={[styles.provider, { color: colors.textSecondary }]} numberOfLines={1}>
              {program.provider}
            </Text>
          )}
        </View>
        <View style={[styles.fitBadge, { backgroundColor: fitColor(program.profile_fit) + '20' }]}>
          <Text style={[styles.fitText, { color: fitColor(program.profile_fit) }]}>
            {fitLabel(program.profile_fit)}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.metaLeft}>
          {program.amount && (
            <Text style={[styles.amount, { color: colors.primary }]}>
              {formatAmount(program.amount)}
            </Text>
          )}
          <View style={[styles.statusDot, { backgroundColor: statusColor(program.status) }]} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {statusLabel(program.status)}
          </Text>
        </View>
        <Text
          style={[
            styles.days,
            { color: daysLeftThemeColor(program.days_left, colors, colors.textMuted) },
          ]}
        >
          {daysLeftText(program.days_left)}
        </Text>
      </View>

      {program.track && (
        <View style={[styles.trackBadge, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.trackText, { color: colors.textMuted }]}>{program.track}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  provider: {
    fontSize: 13,
  },
  fitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fitText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
  },
  days: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  trackText: {
    fontSize: 11,
    fontWeight: '500',
  },
})
