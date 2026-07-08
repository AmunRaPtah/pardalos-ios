import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import type { ProgramFilters } from '@/hooks/usePrograms'

const TRACKS = ['Pre-seed', 'Grant', 'Award', 'Competition', 'Fellowship', 'Accelerator', 'Prize']
const FITS = ['HIGH', 'AMBER', 'LOW']
const STATUSES = ['OPEN', 'CLOSED', 'APPLIED']

interface FilterBarProps {
  filters: ProgramFilters
  onFilterChange: (filters: ProgramFilters) => void
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const theme = useTheme()
  const colors = theme.colors

  const toggleChip = (key: 'track' | 'fit' | 'status', value: string) => {
    onFilterChange({
      ...filters,
      [key]: filters[key] === value ? null : value,
    })
  }

  const renderChips = (label: string, values: string[], key: 'track' | 'fit' | 'status') => (
    <View style={styles.chipGroup}>
      <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {values.map(v => {
          const active = filters[key] === v
          return (
            <TouchableOpacity
              key={v}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surfaceAlt,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => toggleChip(key, v)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? '#ffffff' : colors.textSecondary },
                ]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        placeholder="Search programs..."
        placeholderTextColor={colors.textMuted}
        value={filters.search}
        onChangeText={text => onFilterChange({ ...filters, search: text })}
      />
      {renderChips('Track', TRACKS, 'track')}
      {renderChips('Fit', FITS, 'fit')}
      {renderChips('Status', STATUSES, 'status')}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 8,
  },
  chipGroup: {
    marginBottom: 6,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
})
