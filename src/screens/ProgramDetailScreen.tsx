import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { useTheme } from '@/hooks/useTheme'
import { api } from '@/api/client'
import type { ProgramDetail } from '@/types'
import { LoadingState } from '@/components/LoadingState'
import {
  formatAmount,
  daysLeftText,
  daysLeftColor,
  fitColor,
  fitLabel,
  statusColor,
  statusLabel,
  formatDate,
} from '@/utils/format'

type ParamList = {
  ProgramDetail: { programId: string }
}

export function ProgramDetailScreen() {
  const theme = useTheme()
  const colors = theme.colors
  const navigation = useNavigation()
  const route = useRoute<RouteProp<ParamList, 'ProgramDetail'>>()
  const { programId } = route.params

  const [detail, setDetail] = useState<ProgramDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatResponse, setChatResponse] = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.grantfinder.programDetail(programId)
      setDetail(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load program')
    } finally {
      setLoading(false)
    }
  }, [programId])

  useEffect(() => { fetch() }, [fetch])

  const handleChat = useCallback(async () => {
    if (!chatInput.trim()) return
    setChatLoading(true)
    setChatResponse(null)
    try {
      const result = await api.grantfinder.programChat(programId, chatInput)
      setChatResponse(result?.response || result?.answer || JSON.stringify(result))
    } catch (err: any) {
      setChatResponse(`Error: ${err.message}`)
    } finally {
      setChatLoading(false)
    }
  }, [programId, chatInput])

  const handleTriggerPipeline = useCallback(async () => {
    try {
      const result = await api.grantfinder.triggerPipeline(programId)
      Alert.alert('Pipeline', result?.message || 'Pipeline triggered')
    } catch (err: any) {
      Alert.alert('Error', err.message)
    }
  }, [programId])

  if (loading) return <LoadingState loading message="Loading program details…" />
  if (error) return <LoadingState error={error} onRetry={fetch} />
  if (!detail) return <LoadingState error="Program not found" />

  const urgent = detail.days_left !== undefined && detail.days_left <= 14

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header card */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.titleRow}>
          <View style={styles.titleArea}>
            <Text style={[styles.programName, { color: colors.text }]}>{detail.program}</Text>
            {detail.provider && (
              <Text style={[styles.provider, { color: colors.textSecondary }]}>{detail.provider}</Text>
            )}
          </View>
          <View style={[styles.fitBadge, { backgroundColor: fitColor(detail.profile_fit) + '20' }]}>
            <Text style={[styles.fitText, { color: fitColor(detail.profile_fit) }]}>
              {fitLabel(detail.profile_fit)}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Amount</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{formatAmount(detail.amount)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Track</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{detail.track || '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[styles.statusDot, { backgroundColor: statusColor(detail.status) }]} />
              <Text style={[styles.metaValue, { color: colors.text }]}>{statusLabel(detail.status)}</Text>
            </View>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Deadline</Text>
            <Text
              style={[
                styles.metaValue,
                {
                  color:
                    daysLeftColor(detail.days_left) === 'error'
                      ? colors.error
                      : daysLeftColor(detail.days_left) === 'warning'
                      ? colors.warning
                      : colors.text,
                },
              ]}
            >
              {daysLeftText(detail.days_left)}
            </Text>
          </View>
        </View>

        {detail.deadline_parsed && (
          <Text style={[styles.deadlineDate, { color: colors.textMuted }]}>
            {formatDate(detail.deadline_parsed)}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={handleTriggerPipeline}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnText}>Trigger Pipeline</Text>
          </TouchableOpacity>
          {detail.url && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: colors.primary }]}
              onPress={() => Linking.openURL(detail.url!)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Open URL</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Research section */}
      {detail.research && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Research</Text>
          <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
            {typeof detail.research === 'string'
              ? detail.research
              : detail.research.analysis || detail.research.summary || JSON.stringify(detail.research).slice(0, 500)}
          </Text>
        </View>
      )}

      {/* AI Chat */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ask AI</Text>
        <View style={[styles.chatInputRow, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.chatInput, { color: colors.text }]}
            placeholder="Ask about this program…"
            placeholderTextColor={colors.textMuted}
            value={chatInput}
            onChangeText={setChatInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={handleChat}
            disabled={chatLoading || !chatInput.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendBtnText}>{chatLoading ? '…' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
        {chatResponse && (
          <View style={[styles.chatResponse, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.chatResponseText, { color: colors.textSecondary }]}>
              {chatResponse}
            </Text>
          </View>
        )}
      </View>

      {/* Documents */}
      {detail.documents && detail.documents.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents</Text>
          {detail.documents.map((doc: any, i: number) => (
            <Text key={i} style={[styles.docItem, { color: colors.primary }]}>
              {doc.name || doc.title || `Document ${i + 1}`}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleArea: { flex: 1, marginRight: 12 },
  programName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  provider: { fontSize: 15 },
  fitBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  fitText: { fontSize: 13, fontWeight: '700' },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: { width: '46%' },
  metaLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 16, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  deadlineDate: { fontSize: 13, marginTop: 4 },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnOutline: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  sectionBody: { fontSize: 14, lineHeight: 20 },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chatInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    padding: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chatResponse: {
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  chatResponseText: { fontSize: 14, lineHeight: 20 },
  docItem: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 6,
  },
})
