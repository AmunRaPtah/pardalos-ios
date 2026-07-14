# Building the Pardalos IPA

## Architecture

This app is a **pure WebView wrapper**. It opens a full-screen WebView that loads the
Pardalos web UI directly from `https://pardalos.zyco.org`. The web app handles all UI:
sidebar, mobile bottom nav, icons, theming, routing — everything.

There is NO native navigation, NO native tabs, NO bridge code. The web UI IS the app.

## Prerequisites

1. **Expo account** — Create one free at https://expo.dev/signup
2. **Apple ID** — Free or paid ($99/yr Apple Developer Program). For sideloading, a
   free Apple ID works (7-day expiry via AltStore/SideStore). For App Store/TestFlight,
   you need the paid program.

## Step 1: Authenticate with EAS

```bash
cd /root/projects/pardalos-ios
npx eas login
```

Enter your Expo credentials when prompted.

## Step 2: Set up iOS credentials

```bash
npx eas credentials -p ios
```

Follow the prompts to link your Apple ID. EAS will manage signing certificates and
provisioning profiles automatically.

## Step 3: Build the IPA

### Option A: Preview (sideloadable, recommended for testing)

```bash
npx eas build -p ios --profile preview
```

This produces a signed IPA you can install via:
- **AltStore** / **SideStore** — free sideloading with a free Apple ID
- **Expo Orbit** — desktop companion app
- **Internal distribution** — direct download from Expo dashboard

### Option B: Production (App Store / TestFlight)

```bash
npx eas build -p ios --profile production
```

Requires a paid Apple Developer Program account ($99/yr).

### Option C: Development Simulator (runs in Xcode Simulator only)

```bash
npx eas build -p ios --profile development-simulator --local
```

## Download the IPA

After the cloud build completes, EAS will print a URL. You can:
- Download the `.ipa` directly from the Expo dashboard at
  https://expo.dev/account/projects/pardalos/builds
- Or install it directly on your device using the QR code shown in the terminal

## Troubleshooting

### "Not logged in"
Run `npx eas login`.

### "Missing credentials"
Run `npx eas credentials -p ios` to set up signing.

### Build fails on TypeScript
Run `npx tsc --noEmit` locally first to catch any type errors.

### Free Apple ID limits
Free Apple IDs need to re-sign the IPA every 7 days. Use AltStore's auto-signing
feature to handle this.

## File Structure

```
pardalos-ios/
├── App.tsx                 # Entry point — just SafeAreaProvider + WebView
├── src/
│   ├── PardalosWebView.tsx # Full-screen WebView loading server URL
│   └── config.ts           # Server URL constant
├── app.json                # Expo configuration
├── eas.json                # EAS Build profiles
└── package.json            # Minimal dependencies (Expo, WebView)
```
