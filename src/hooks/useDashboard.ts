// ── Dashboard data hook ──

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/api/client'
import type { DashboardData, GrowthReport } from '@/types'

interface DashboardState {
  dashboard: DashboardData | null
  growth: GrowthReport | null
  loading: boolean
  error: string | null
  refreshing: boolean
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    dashboard: null,
    growth: null,
    loading: true,
    error: null,
    refreshing: false,
  })

  const fetch = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setState(prev => ({ ...prev, refreshing: true, error: null }))
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }))
    }

    try {
      const [dashboard, growth] = await Promise.all([
        api.grantfinder.dashboard(),
        api.grantfinder.growthReport(),
      ])
      setState({
        dashboard,
        growth,
        loading: false,
        error: null,
        refreshing: false,
      })
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err.message || 'Failed to load dashboard',
      }))
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const refresh = useCallback(() => fetch(true), [fetch])

  return { ...state, refresh }
}
