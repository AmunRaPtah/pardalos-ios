import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PardalosWebView } from './src/PardalosWebView'

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <PardalosWebView />
    </SafeAreaProvider>
  )
}
