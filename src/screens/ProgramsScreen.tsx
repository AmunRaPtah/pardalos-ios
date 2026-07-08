import React, { useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '@/hooks/useTheme'
import { usePrograms, type ProgramFilters } from '@/hooks/usePrograms'
import { ProgramRow } from '@/components/ProgramRow'
import { FilterBar } from '@/components/FilterBar'
import { LoadingState } from '@/components/LoadingState'

export function ProgramsScreen() {
  const theme = useTheme()
  const colors = theme.colors
  const navigation = useNavigation<any>()
  const {
    programs,
    loading,
    error,
    refreshing,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    refresh,
    total,
    filtered,
  } = usePrograms()

  const handleProgramPress = useCallback(
    (id: string) => navigation.navigate('ProgramDetail', { programId: id }),
    [navigation],
  )

  const handleFilterChange = useCallback(
    (newFilters: ProgramFilters) => setFilters(newFilters),
    [setFilters],
  )

  if (loading && !refreshing) {
    return <LoadingState loading message="Loading programs…" />
  }

  if (error && programs.length === 0) {
    return <LoadingState error={error} onRetry={refresh} />
  }

  const renderHeader = () => (
    <View>
      {/* Title bar */}
      <View style={styles.titleBar}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Programs</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {filtered} of {total} programs
          </Text>
        </View>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
            <Text style={[styles.clearBtn, { color: colors.primary }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Results */}
      {programs.length === 0 && (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {hasActiveFilters ? 'No programs match your filters' : 'No programs found'}
          </Text>
        </View>
      )}
    </View>
  )

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.listContent}
      data={programs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProgramRow program={item} onPress={handleProgramPress} />
      )}
      ListHeaderComponent={renderHeader}
      stickyHeaderIndices={[1]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 32 },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  clearBtn: { fontSize: 15, fontWeight: '600' },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15 },
})
