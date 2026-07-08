import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/api/client'
import type { ApplicationItem } from '@/types'
import { LoadingState } from '@/components/LoadingState'
import { formatDate, statusColor, statusLabel, formatAmount } from '@/utils/format'

export function ApplicationsScreen() {
  const theme = useTheme()
  const colors = theme.colors
  const navigation = useNavigation<any>()
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetch = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const data = await api.grantfinder.applications()
      setApplications(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load applications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading && !refreshing) {
    return <LoadingState loading message="Loading applications…" />
  }

  if (error && applications.length === 0) {
    return <LoadingState error={error} onRetry={() => fetch()} />
  }

  const renderItem = ({ item }: { item: ApplicationItem }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('ProgramDetail', { programId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTitleArea}>
          <Text style={[styles.programName, { color: colors.text }]} numberOfLines={1}>
            {item.program}
          </Text>
          {item.provider && (
            <Text style={[styles.provider, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.provider}
            </Text>
          )}
        </View>
        <View style={[styles.outcomeBadge, { backgroundColor: statusColor(item.outcome || '') + '20' }]}>
          <Text style={[styles.outcomeText, { color: statusColor(item.outcome || '') }]}>
            {item.outcome || item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          Applied: {formatDate(item.applied_date)}
        </Text>
        {item.amount && (
          <Text style={[styles.amount, { color: colors.primary }]}>
            {formatAmount(item.amount)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Applications</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {applications.length} program{applications.length !== 1 ? 's' : ''}
      </Text>
    </View>
  )

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.listContent}
      data={applications}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No applications yet
          </Text>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          tintColor={colors.primary}
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleArea: { flex: 1, marginRight: 8 },
  programName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  provider: { fontSize: 13 },
  outcomeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  outcomeText: { fontSize: 12, fontWeight: '700' },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: { fontSize: 13 },
  amount: { fontSize: 15, fontWeight: '700' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15 },
})
