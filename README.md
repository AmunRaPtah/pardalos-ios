# Pardalos iOS

Native iOS app for **Pardalos** — your grant pipeline automation platform.

Track grant programs, view deadlines, trigger pipeline actions, and monitor your grant pipeline — all from your iPhone.

## Build an IPA (sideloadable)

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

> Create a free Expo account at https://expo.dev if you don't have one.

### 3. Build the IPA via EAS Cloud

```bash
eas build -p ios --profile production
```

This produces an IPA in the Expo cloud. You'll get a download link.

### 4. Build locally (optional)

If you have macOS with Xcode, you can build locally:

```bash
eas build -p ios --profile production --local
```

### 5. Sideload the IPA

Use one of these tools to install the IPA on your iPhone:

| Tool | Requirement | Notes |
|------|-------------|-------|
| **AltStore** | Free Apple ID | Re-signs every 7 days |
| **SideStore** | Free Apple ID | Wireless, 7-day expiry |
| **Sideloadly** | Free Apple ID | Windows/Mac |
| **TrollStore** | iOS 14-17.0 | No expiry (if supported) |

For production use, consider an Apple Developer account ($99/yr) for 1-year signing.

## First Run

1. Open the app
2. Go to **Settings** tab
3. Enter your Pardalos server URL (e.g., `https://pardalos.zyco.org`)
4. Tap **Save & Test**
5. Once connected, the Dashboard will load your pipeline data

Your Pardalos server must be running and accessible from your iPhone (same network or over the internet via a domain/reverse proxy).

## Development

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Test TypeScript compilation
npx tsc --noEmit

# Export for iOS (verify bundling)
npx expo export --platform ios
```

## Architecture

```
pardalos-ios/
├── App.tsx                 # Root — SafeAreaProvider + NavigationContainer
├── app.json                # Expo config (iOS bundle, splash, etc.)
├── eas.json                # EAS Build profiles
├── src/
│   ├── api/client.ts       # Fetch-based API client with configurable base URL
│   ├── types/              # TypeScript types matching Pardalos API
│   ├── hooks/              # Data fetching + state hooks
│   ├── screens/            # 5 screens: Dashboard, Programs, Detail, Applications, Settings
│   ├── components/         # Reusable UI components
│   ├── navigation/         # Tab + Stack navigator
│   ├── theme/              # Dark/light theme
│   └── utils/              # Formatting utilities
└── assets/                 # App icon, splash screen
```

The app communicates with the Pardalos FastAPI backend via REST (`/api/grantfinder/*` endpoints). No WebView — native UIKit/React Native screens throughout.
