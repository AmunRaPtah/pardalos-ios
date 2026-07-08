// ── Programs list hook with search, filter, and sort ──

import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '@/api/client'
import type { Programme } from '@/types'

interface ProgramsState {
  programs: Programme[]
  loading: boolean
  error: string | null
  refreshing: boolean
}

export interface ProgramFilters {
  search: string
  track: string | null
  fit: string | null
  status: string | null
  sortBy: 'days_left' | 'amount' | 'name' | 'deadline'
  sortDir: 'asc' | 'desc'
}

export function usePrograms() {
  const [state, setState] = useState<ProgramsState>({
    programs: [],
    loading: true,
    error: null,
    refreshing: false,
  })

  const [filters, setFilters] = useState<ProgramFilters>({
    search: '',
    track: null,
    fit: null,
    status: null,
    sortBy: 'days_left',
    sortDir: 'asc',
  })

  const fetch = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setState(prev => ({ ...prev, refreshing: true, error: null }))
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }))
    }

    try {
      const programs = await api.grantfinder.programs('limit=250')
      setState({
        programs: programs || [],
        loading: false,
        error: null,
        refreshing: false,
      })
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err.message || 'Failed to load programs',
      }))
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const refresh = useCallback(() => fetch(true), [fetch])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      track: null,
      fit: null,
      status: null,
      sortBy: 'days_left',
      sortDir: 'asc',
    })
  }, [])

  const hasActiveFilters = filters.search || filters.track || filters.fit || filters.status

  // Filtered + sorted programs (memoized)
  const filteredPrograms = useMemo(() => {
    let result = [...state.programs]

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        p =>
          p.program.toLowerCase().includes(q) ||
          p.provider?.toLowerCase().includes(q),
      )
    }

    // Track filter
    if (filters.track) {
      result = result.filter(p => p.track === filters.track)
    }

    // Fit filter
    if (filters.fit) {
      result = result.filter(p => p.profile_fit === filters.fit)
    }

    // Status filter
    if (filters.status) {
      result = result.filter(p => p.status === filters.status)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (filters.sortBy) {
        case 'days_left': {
          const da = a.days_left ?? 9999
          const db = b.days_left ?? 9999
          cmp = da - db
          break
        }
        case 'amount': {
          const aa = parseFloat(a.amount?.replace(/[^0-9.]/g, '') || '0')
          const ab = parseFloat(b.amount?.replace(/[^0-9.]/g, '') || '0')
          cmp = ab - aa // larger amounts first by default
          break
        }
        case 'name':
          cmp = a.program.localeCompare(b.program)
          break
        case 'deadline':
          cmp = (a.deadline_parsed || '').localeCompare(b.deadline_parsed || '')
          break
      }
      return filters.sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [state.programs, filters])

  return {
    ...state,
    programs: filteredPrograms,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    refresh,
    total: state.programs.length,
    filtered: filteredPrograms.length,
  }
}
