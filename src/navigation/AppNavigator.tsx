import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '@/hooks/useTheme'
import { DashboardScreen } from '@/screens/DashboardScreen'
import { ProgramsScreen } from '@/screens/ProgramsScreen'
import { ProgramDetailScreen } from '@/screens/ProgramDetailScreen'
import { ApplicationsScreen } from '@/screens/ApplicationsScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { BrowserScreen } from '@/screens/BrowserScreen'
import { FilesScreen } from '@/screens/FilesScreen'
import { Text } from 'react-native'

type TabParamList = {
  DashboardTab: undefined
  ProgramsTab: undefined
  ApplicationsTab: undefined
  BrowserTab: undefined
  FilesTab: undefined
  SettingsTab: undefined
}

type StackParamList = {
  ProgramsList: undefined
  ProgramDetail: { programId: string }
}

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<StackParamList>()

function ProgramsStack() {
  const theme = useTheme()
  const colors = theme.colors

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="ProgramsList"
        component={ProgramsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProgramDetail"
        component={ProgramDetailScreen}
        options={{
          title: 'Program',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  )
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Programs: '🎯',
    Applications: '📋',
    Browser: '🌐',
    Files: '📁',
    Settings: '⚙️',
  }
  return (
    <Text style={{ fontSize: focused ? 24 : 22 }}>{icons[label] || '📄'}</Text>
  )
}

export function AppNavigator() {
  const theme = useTheme()
  const colors = theme.colors

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name.replace('Tab', '')} focused={focused} />
        ),
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="ProgramsTab"
        component={ProgramsStack}
        options={{ tabBarLabel: 'Programs' }}
      />
      <Tab.Screen
        name="ApplicationsTab"
        component={ApplicationsScreen}
        options={{ tabBarLabel: 'Apps' }}
      />
      <Tab.Screen
        name="BrowserTab"
        component={BrowserScreen}
        options={{ tabBarLabel: 'Browser' }}
      />
      <Tab.Screen
        name="FilesTab"
        component={FilesScreen}
        options={{ tabBarLabel: 'Files' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  )
}
