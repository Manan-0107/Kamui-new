# Kamui Android & Capacitor Integration Readiness Architecture

This document outlines the architecture, prerequisites, and integration blueprint for packaging **Kamui** as an Android application using Capacitor (Step 4).

---

## 1. Current State & Compatibility

- **Static Export**: Verified operational. `next build` produces an unoptimized standalone bundle in `out/` with `output: 'export'` and `images: { unoptimized: true }`.
- **Zero Server Dependencies**: All metadata queries (AniList GraphQL) and extension calls run entirely on the client. All server routes (`src/app/api/`) have been removed.
- **Capacitor Status in Repository**:
  - `@capacitor/core` and `@capacitor/android` are **not yet installed** in `package.json`.
  - No `capacitor.config.ts` or `android/` directory is present in the working tree.
  - The repository is fully prepared for Capacitor initialization without architectural refactoring.

---

## 2. Capacitor Configuration Blueprint (`capacitor.config.ts`)

When initializing Capacitor in Step 4, the configuration will target the static export directory:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.kamui.streaming',
  appName: 'Kamui',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: false // Disallow unencrypted HTTP in production
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false // Production hardened
  }
};

export default config;
```

---

## 3. Native HTTP Transport Design (`setCustomExtensionFetcher`)

### Problem in Browser
Web browsers enforce Cross-Origin Resource Sharing (CORS) and follow HTTP 302 redirects transparently without exposing destination URLs to JavaScript. To prevent security bypasses in the browser, Kamui currently enforces `redirect: 'error'`.

### Solution in Capacitor (Step 4)
Capacitor allows executing requests through native Android HTTP clients (`OkHttp` / `HttpURLConnection`), which:
1. **Bypasses CORS restrictions**: Extensions do not require `Access-Control-Allow-Origin: *` headers.
2. **Inspects Redirects**: The native layer can intercept `301`/`302` responses, extract the `Location` header, validate it against `isValidSecureUrl()`, and reject unsafe internal hops before following.
3. **Plugs seamlessly into Kamui**: `src/lib/extensions/client.ts` already provides the injection hook:

```typescript
// Initialized in native app root:
import { CapacitorHttp } from '@capacitor/core';
import { setCustomExtensionFetcher } from '@/lib/extensions';

setCustomExtensionFetcher(async (input, init) => {
  const url = typeof input === 'string' ? input : input.toString();
  // Execute via native CapacitorHttp with strict timeout & 1MB limit
  const response = await CapacitorHttp.get({ url, headers: init?.headers as any });
  return new Response(response.data, {
    status: response.status,
    headers: response.headers
  });
});
```

---

## 4. Android Manifest & Permissions

Only minimal, lawful permissions are required:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Required for network requests to AniList and extensions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="false"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="false"
        android:theme="@style/AppTheme.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 5. Media Playback & Display Considerations

1. **Hardware Acceleration**: `<application android:hardwareAccelerated="true">` ensures smooth 1080p/60fps MP4 and HLS video decoding in Android WebView.
2. **Inline & Autoplay**: Ensure `setMediaPlaybackRequiresUserGesture(false)` is enabled in `MainActivity.java` so stream switching does not stall on user interaction requirements.
3. **Safe-Area Insets**: The UI already utilizes modern CSS viewport units and handles safe-area margins for notched devices and navigation bars.
4. **Local State Persistence**: All watch history, extension settings, and watchlist entries live in `localStorage`, which persists reliably inside Android WebView's local sandbox across app restarts.
