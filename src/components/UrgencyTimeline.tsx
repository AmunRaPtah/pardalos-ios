import React, { useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import type { UrgencyItem } from '@/types'
import { formatAmount } from '@/utils/format'

interface UrgencyTimelineProps {
  items: UrgencyItem[]
  onProgramPress: (id: string) => void
  maxItems?: number
}

export function UrgencyTimeline({ items, onProgramPress, maxItems = 20 }: UrgencyTimelineProps) {
  const theme = useTheme()
  const colors = theme.colors
  const scrollRef = useRef<ScrollView>(null)

  if (!items || items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No urgent deadlines
        </Text>
      </View>
    )
  }

  const display = items.slice(0, maxItems)

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Urgency Timeline
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {items.length} programs due in the next 90 days
      </Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {display.map((item) => {
          const urgent = item.days_left <= 7
          const soon = item.days_left <= 14
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: urgent ? colors.error + '15' : soon ? colors.warning + '10' : colors.surfaceAlt,
                  borderColor: urgent ? colors.error + '40' : soon ? colors.warning + '30' : colors.border,
                },
              ]}
              onPress={() => onProgramPress(item.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.days,
                { color: urgent ? colors.error : soon ? colors.warning : colors.text },
              ]}>
                {item.days_left}d
              </Text>
              <Text style={[styles.programName, { color: colors.text }]} numberOfLines={2}>
                {item.program}
              </Text>
              {item.amount && (
                <Text style={[styles.amount, { color: colors.primaryLight }]}>
                  {formatAmount(item.amount)}
                </Text>
              )}
              <View style={[styles.fitBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.fitText, { color: colors.primary }]}>{item.fit}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const CARD_WIDTH = 140

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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  scroll: {
    marginHorizontal: -4,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 8,
  },
  card: {
    width: CARD_WIDTH,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  days: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  programName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 6,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  fitBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fitText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
  },
})
