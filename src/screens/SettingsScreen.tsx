import React, { useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native'
import { useTheme, setThemeOverride } from '@/hooks/useTheme'
import { useServerConfig } from '@/hooks/useServerConfig'

export function SettingsScreen() {
  const theme = useTheme()
  const colors = theme.colors
  const { url, isConnected, isChecking, error, checkConnection, updateUrl, resetUrl } =
    useServerConfig()

  const [localUrl, setLocalUrl] = React.useState(url)

  useEffect(() => {
    setLocalUrl(url)
  }, [url])

  const handleSave = async () => {
    if (!localUrl.trim()) {
      Alert.alert('Error', 'Please enter a server URL')
      return
    }
    const cleaned = localUrl.replace(/\/+$/, '')
    await updateUrl(cleaned)
    checkConnection()
  }

  const handleReset = async () => {
    await resetUrl()
    setLocalUrl('http://localhost:8001')
    Alert.alert('Reset', 'Server URL reset to default')
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      {/* Server Connection */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Server Connection</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Pardalos Server URL</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border },
          ]}
          value={localUrl}
          onChangeText={setLocalUrl}
          placeholder="http://your-server:8001"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <View style={styles.statusRow}>
          {isChecking && (
            <Text style={[styles.checkingText, { color: colors.textSecondary }]}>
              Checking connection…
            </Text>
          )}
          {!isChecking && isConnected && (
            <View style={styles.connectedRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.success }]}>Connected</Text>
            </View>
          )}
          {!isChecking && error && (
            <View style={styles.connectedRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
              <Text style={[styles.statusText, { color: colors.error }]}>{error}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Save & Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline, { borderColor: colors.border }]}
            onPress={checkConnection}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonTextOutline, { color: colors.text }]}>Test</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
          <Text style={[styles.resetText, { color: colors.warning }]}>Reset to Default</Text>
        </TouchableOpacity>
      </View>

      {/* Get Started */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Getting Started</Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          1. Enter your Pardalos server URL (e.g., https://pardalos.zyco.org){'\n'}
          2. Tap "Save & Test" to verify the connection{'\n'}
          3. The dashboard will load with your grant pipeline data{'\n'}
          {'\n'}
          Your Pardalos server must be running and accessible from your iPhone.
        </Text>
      </View>

      {/* App Info */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>App</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>Pardalos</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Version</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Bundle</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>com.pardalos.app</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  statusRow: {
    marginTop: 8,
    minHeight: 20,
  },
  checkingText: { fontSize: 13 },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  buttonTextOutline: { fontSize: 15, fontWeight: '600' },
  resetText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  bodyText: { fontSize: 14, lineHeight: 20 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
})
