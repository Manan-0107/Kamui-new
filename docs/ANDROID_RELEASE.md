# Kamui Android Release Guide (v0.1)

This guide documents the Android build architecture, automated CI workflow, installation instructions, and signing procedure for Kamui v0.1.

---

## 1. Build Architecture & Requirements

Kamui is packaged for Android using **Capacitor 8**. The project specifications are configured in `android/variables.gradle`:
- **Compile SDK:** `android-36`
- **Target SDK:** `android-36`
- **Minimum SDK:** `android-24` (Android 7.0 Nougat and above)
- **Android Gradle Plugin (AGP):** `8.13.0`
- **Gradle Version:** `8.14.3`
- **Required Java/JDK:** JDK 21 (Eclipse Temurin recommended)

---

## 2. Automated Debug APK Build via GitHub Actions

A reproducible CI workflow is provided at `.github/workflows/android-debug-apk.yml`. Every push to `main` (or manual trigger via GitHub `Actions` -> `Run workflow`) automatically:
1. Installs Node 20 dependencies reproducibly using `package-lock.json` (`npm ci`).
2. Runs static code quality gates:
   - TypeScript compilation: `npx tsc --noEmit`
   - Next.js and ESLint checks: `npm run lint`
   - Vitest automated tests: `npm test`
3. Generates the optimized Next.js static bundle (`npm run build`).
4. Configures JDK 21 and the Android SDK (`platforms;android-36`, `build-tools;36.0.0`).
5. Synchronizes web assets with Capacitor (`npx cap sync android`).
6. Executes Gradle assemble: `./gradlew assembleDebug`.
7. Uploads the verified artifact as **`kamui-v0.1-debug-apk`** (`app-debug.apk`), downloadable directly from the GitHub Actions run summary.

---

## 3. How to Download and Install the Debug APK

### Option A: From GitHub Actions (Recommended)
1. Navigate to your repository on GitHub.
2. Click on the **Actions** tab.
3. Select the latest run of **Build Android Debug APK**.
4. Scroll to the bottom under **Artifacts** and click **kamui-v0.1-debug-apk** to download the ZIP archive.
5. Extract `app-debug.apk`.

### Option B: Installing on Device / Emulator via ADB
1. Enable **Developer Options** and **USB Debugging** on your Android device.
2. Connect your device via USB (or start an Android Virtual Device in Android Studio).
3. Verify ADB detects your device:
   ```bash
   adb devices
   ```
4. Install the debug APK:
   ```bash
   adb install -r app-debug.apk
   ```
5. Launch Kamui from your app drawer.

### Option C: Direct Device Install
1. Transfer `app-debug.apk` to your phone storage or download via browser.
2. Open the file on your device and permit installation from the browser / file manager ("Install unknown apps").

---

## 4. Local Build Instructions (Host Requirements)

To build the APK locally on your development machine:
1. Ensure **JDK 21** is installed and `JAVA_HOME` is configured in your system environment.
2. Install **Android Studio** and the Android SDK command-line tools. Set `ANDROID_HOME` (e.g. `C:\Users\<user>\AppData\Local\Android\Sdk` on Windows or `~/Library/Android/sdk` on macOS).
3. Ensure SDK Platform `android-36` and Build-Tools `36.0.0` are installed:
   ```bash
   sdkmanager "platforms;android-36" "build-tools;36.0.0"
   ```
4. Build web assets and sync:
   ```bash
   npm run build
   npx cap sync android
   ```
5. Build the debug APK with Gradle:
   - **Linux / macOS:**
     ```bash
     cd android && ./gradlew assembleDebug
     ```
   - **Windows PowerShell:**
     ```powershell
     cd android
     .\gradlew.bat assembleDebug
     ```
6. The resulting APK is located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 5. Release Signing Guide (For Future Production Distribution)

> [!CAUTION]
> **Never commit your private signing key or keystore passwords to Git.** Keystores must remain stored in secure local storage or GitHub Actions encrypted secrets.

To produce a signed release APK for GitHub Releases:

### Step 1: Generate a Release Keystore
```bash
keytool -genkey -v -keystore kamui-release.keystore -alias kamui -keyalg RSA -keysize 2048 -validity 10000
```
Keep `kamui-release.keystore` secure.

### Step 2: Configure Environment Variables in CI / Local
Set the following secrets in your GitHub repository (`Settings -> Secrets and variables -> Actions`):
- `KEYSTORE_BASE64`: Base64 encoded content of `kamui-release.keystore`
- `KEYSTORE_PASSWORD`: Keystore password
- `KEY_ALIAS`: `kamui`
- `KEY_PASSWORD`: Key password

### Step 3: Configure Signing in `android/app/build.gradle`
In `android/app/build.gradle`:
```groovy
android {
    ...
    signingConfigs {
        release {
            if (System.getenv("KEYSTORE_PATH")) {
                storeFile file(System.getenv("KEYSTORE_PATH"))
                storePassword System.getenv("KEYSTORE_PASSWORD")
                keyAlias System.getenv("KEY_ALIAS")
                keyPassword System.getenv("KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Assemble Release APK
```bash
cd android
./gradlew assembleRelease
```
The signed APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`
