import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '@/hooks/useTheme'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCard } from '@/components/StatCard'
import { UrgencyTimeline } from '@/components/UrgencyTimeline'
import { GrowthCard } from '@/components/GrowthCard'
import { LoadingState } from '@/components/LoadingState'

export function DashboardScreen() {
  const theme = useTheme()
  const colors = theme.colors
  const navigation = useNavigation<any>()
  const { dashboard, growth, loading, error, refreshing, refresh } = useDashboard()

  if (loading && !dashboard) {
    return <LoadingState loading message="Loading dashboard…" />
  }

  if (error && !dashboard) {
    return <LoadingState error={error} onRetry={refresh} />
  }

  const stats = dashboard?.stats
  const trackBreakdown = dashboard?.track_breakdown

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Pardalos</Text>
          <Text style={[styles.title, { color: colors.text }]}>Grant Pipeline</Text>
        </View>
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('SettingsTab')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statCardWrap}>
            <StatCard
              label="Total"
              value={stats.total ?? dashboard?.total_programs ?? 0}
              color={colors.text}
              icon="📊"
            />
          </View>
          <View style={styles.statCardWrap}>
            <StatCard
              label="Actionable"
              value={stats.actionable ?? 0}
              color={colors.primary}
              icon="🎯"
            />
          </View>
          <View style={styles.statCardWrap}>
            <StatCard
              label="Enriched"
              value={stats.enriched ?? 0}
              color={colors.success}
              icon="✨"
            />
          </View>
          <View style={styles.statCardWrap}>
            <StatCard
              label="High Fit"
              value={growth?.current?.high_fit ?? stats.high_fit ?? 0}
              color={colors.info}
              icon="⭐"
            />
          </View>
        </View>
      )}

      {/* Urgency timeline */}
      {dashboard?.timeline && dashboard.timeline.length > 0 && (
        <UrgencyTimeline
          items={dashboard.timeline}
          onProgramPress={(id) =>
            navigation.navigate('ProgramsTab', { screen: 'ProgramDetail', params: { programId: id } })
          }
        />
      )}

      {/* Growth card */}
      {growth && <GrowthCard growth={growth} />}

      {/* Track breakdown */}
      {trackBreakdown && Object.keys(trackBreakdown).length > 0 && (
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tracks</Text>
          {Object.entries(trackBreakdown).map(([track, data]: [string, any]) => (
            <View key={track} style={[styles.trackRow, { borderBottomColor: colors.border }]}>
              <View style={styles.trackInfo}>
                <Text style={[styles.trackName, { color: colors.text }]}>{track}</Text>
                <Text style={[styles.trackCount, { color: colors.textSecondary }]}>
                  {data.total} programs
                </Text>
              </View>
              <View style={styles.trackStats}>
                <View style={[styles.trackDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.trackStat, { color: colors.textSecondary }]}>{data.open} open</Text>
                {data.urgent > 0 && (
                  <>
                    <View style={[styles.trackDot, { backgroundColor: colors.warning }]} />
                    <Text style={[styles.trackStat, { color: colors.warning }]}>{data.urgent} urgent</Text>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('ProgramsTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>View All Programs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ApplicationsTab')}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionBtnText, { color: colors.text }]}>Applications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800' },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  settingsIcon: { fontSize: 18 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  statCardWrap: {
    width: '48%',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  trackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trackInfo: {},
  trackName: { fontSize: 14, fontWeight: '600' },
  trackCount: { fontSize: 12, marginTop: 2 },
  trackStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackDot: { width: 6, height: 6, borderRadius: 3 },
  trackStat: { fontSize: 12 },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnSecondary: {
    borderWidth: 1,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
})
