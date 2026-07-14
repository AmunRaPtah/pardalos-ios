// ── Documents / File manager ──
// Import files into the app's document store, list them, open/share, and delete.
// Uses the stable legacy expo-file-system API for reliability across SDK versions.

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as FileSystem from 'expo-file-system/legacy'
import * as DocumentPicker from 'expo-document-picker'
import * as Sharing from 'expo-sharing'
import { useTheme } from '@/hooks/useTheme'
import { LoadingState } from '@/components/LoadingState'

interface Entry {
  name: string
  uri: string
  size: number
  modified: number
}

const DOCS_DIR = FileSystem.documentDirectory + 'Files/'

function humanSize(bytes: number): string {
  if (!bytes || bytes < 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let n = bytes
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

function iconFor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return '📕'
  if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return '📄'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊'
  if (['png', 'jpg', 'jpeg', 'gif', 'heic', 'webp'].includes(ext)) return '🖼️'
  if (['zip', 'tar', 'gz', '7z'].includes(ext)) return '🗜️'
  if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) return '🎵'
  if (['mp4', 'mov', 'mkv'].includes(ext)) return '🎬'
  return '📎'
}

export function FilesScreen() {
  const theme = useTheme()
  const colors = theme.colors
  const styles = useMemo(() => makeStyles(colors, theme), [colors, theme])

  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const ensureDir = useCallback(async () => {
    const info = await FileSystem.getInfoAsync(DOCS_DIR)
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(DOCS_DIR, { intermediates: true })
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      await ensureDir()
      const names = await FileSystem.readDirectoryAsync(DOCS_DIR)
      const items: Entry[] = []
      for (const name of names) {
        const uri = DOCS_DIR + name
        const info = await FileSystem.getInfoAsync(uri, { size: true } as any)
        items.push({
          name,
          uri,
          size: (info as any).size ?? 0,
          modified: (info as any).modificationTime ?? 0,
        })
      }
      items.sort((a, b) => b.modified - a.modified)
      setEntries(items)
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not read files')
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [ensureDir])

  useEffect(() => {
    load()
  }, [load])

  const importFiles = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
      })
      if (res.canceled) return
      await ensureDir()
      for (const asset of res.assets) {
        const safeName = asset.name || `file-${Date.now()}`
        let dest = DOCS_DIR + safeName
        // Avoid clobbering an existing file with the same name.
        const existing = await FileSystem.getInfoAsync(dest)
        if (existing.exists) {
          const dot = safeName.lastIndexOf('.')
          const stem = dot > 0 ? safeName.slice(0, dot) : safeName
          const ext = dot > 0 ? safeName.slice(dot) : ''
          dest = `${DOCS_DIR}${stem}-${Date.now()}${ext}`
        }
        await FileSystem.copyAsync({ from: asset.uri, to: dest })
      }
      await load()
    } catch (e: any) {
      Alert.alert('Import failed', e?.message ?? 'Unknown error')
    }
  }, [ensureDir, load])

  const shareFile = useCallback(async (entry: Entry) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Unavailable', 'Sharing is not available on this device')
        return
      }
      await Sharing.shareAsync(entry.uri)
    } catch (e: any) {
      Alert.alert('Share failed', e?.message ?? 'Unknown error')
    }
  }, [])

  const deleteFile = useCallback(
    (entry: Entry) => {
      Alert.alert('Delete file', `Delete "${entry.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(entry.uri, { idempotent: true })
              await load()
            } catch (e: any) {
              Alert.alert('Delete failed', e?.message ?? 'Unknown error')
            }
          },
        },
      ])
    },
    [load]
  )

  const renderItem = useCallback(
    ({ item }: { item: Entry }) => (
      <TouchableOpacity
        style={styles.row}
        onPress={() => shareFile(item)}
        onLongPress={() => deleteFile(item)}
      >
        <Text style={styles.icon}>{iconFor(item.name)}</Text>
        <View style={styles.rowMain}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.meta}>{humanSize(item.size)}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteFile(item)} hitSlop={12}>
          <Text style={styles.trash}>🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [styles, shareFile, deleteFile]
  )

  if (initialLoad && loading) {
    return <LoadingState loading message="Loading files…" />
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <TouchableOpacity style={styles.importBtn} onPress={importFiles}>
          <Text style={styles.importText}>＋ Import</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => item.uri}
        renderItem={renderItem}
        contentContainerStyle={entries.length === 0 ? styles.emptyWrap : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptyText}>
              Tap “Import” to add files. Tap a file to open/share, long-press to delete.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

function makeStyles(colors: any, theme: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    title: { fontSize: theme.fontSize.title, fontWeight: '700', color: colors.text },
    importBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    importText: { color: '#fff', fontWeight: '700', fontSize: theme.fontSize.sm },
    listContent: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: { fontSize: 26, marginRight: theme.spacing.md },
    rowMain: { flex: 1 },
    name: { color: colors.text, fontSize: theme.fontSize.md, fontWeight: '600' },
    meta: { color: colors.textSecondary, fontSize: theme.fontSize.xs, marginTop: 2 },
    trash: { fontSize: 18, marginLeft: theme.spacing.sm },
    emptyWrap: { flexGrow: 1, justifyContent: 'center' },
    empty: { alignItems: 'center', padding: theme.spacing.xl },
    emptyIcon: { fontSize: 56, marginBottom: theme.spacing.md },
    emptyTitle: { color: colors.text, fontSize: theme.fontSize.lg, fontWeight: '700' },
    emptyText: {
      color: colors.textSecondary,
      fontSize: theme.fontSize.sm,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      lineHeight: 20,
    },
  })
}
