import { useColorScheme } from 'react-native'
import { darkTheme, lightTheme } from '@/theme'

let _forcedDark: boolean | null = null

export function setThemeOverride(isDark: boolean | null) {
  _forcedDark = isDark
}

export function useTheme() {
  const systemScheme = useColorScheme()
  const isDark = _forcedDark !== null ? _forcedDark : systemScheme === 'dark'
  return isDark ? darkTheme : lightTheme
}
