// ── Server URL configuration hook ──

import { useState, useEffect, useCallback } from 'react'
import { getServerUrl, setServerUrl, clearCachedUrl, api } from '@/api/client'

interface ServerConfigState {
  url: string
  isConnected: boolean
  isChecking: boolean
  error: string | null
}

export function useServerConfig() {
  const [state, setState] = useState<ServerConfigState>({
    url: '',
    isConnected: false,
    isChecking: false,
    error: null,
  })

  useEffect(() => {
    getServerUrl().then(url => {
      setState(prev => ({ ...prev, url }))
    })
  }, [])

  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true, error: null }))
    try {
      const result = await api.health()
      setState(prev => ({
        ...prev,
        isConnected: result.status === 'ok',
        isChecking: false,
        error: result.status === 'ok' ? null : 'Unexpected response',
      }))
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isChecking: false,
        error: err.message || 'Connection failed',
      }))
    }
  }, [])

  const updateUrl = useCallback(async (url: string) => {
    await setServerUrl(url)
    setState(prev => ({ ...prev, url, isConnected: false, error: null }))
  }, [])

  const resetUrl = useCallback(async () => {
    await setServerUrl('http://localhost:8001')
    clearCachedUrl()
    setState({
      url: 'http://localhost:8001',
      isConnected: false,
      isChecking: false,
      error: null,
    })
  }, [])

  return { ...state, checkConnection, updateUrl, resetUrl }
}
