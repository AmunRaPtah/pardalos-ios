import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppNavigator } from '@/navigation/AppNavigator'
import { BridgeProvider } from '@/bridge/BridgeContext'

export default function App() {
  return (
    <SafeAreaProvider>
      <BridgeProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </BridgeProvider>
    </SafeAreaProvider>
  )
}
