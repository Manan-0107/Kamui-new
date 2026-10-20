# Kamui Manual QA Checklist & Verification Guide

This document defines the manual QA protocol for **Kamui**, covering declarative extension management, error resilience, playback, keyboard controls, watch-history persistence, responsive UI, and Android integration readiness.

---

## 1. Test Execution Matrix Summary

| Test Category | Automated Unit Coverage | Manual Browser QA | Android Device QA |
|---|---|---|---|
| **Extension Lifecycle** | Verified in Vitest | Tested & Verified | Pending Android build |
| **Security & URL Validation** | Verified in Vitest | Tested & Verified | Pending Android build |
| **Redirect Rejection Policy** | Verified in Vitest | Tested & Verified | Pending Native Transport |
| **Resilience & Timeouts** | Verified in Vitest | Tested & Verified | Pending Android build |
| **Multi-Extension Merging** | Verified in Vitest | Tested & Verified | Pending Android build |
| **Playback & HLS / MP4** | Mocked in Vitest | Tested & Verified | Pending WebView testing |
| **Watch History & Persistence** | Verified in Vitest | Tested & Verified | Pending Android build |
| **Keyboard Accessibility** | Verified in Vitest | Tested & Verified | N/A (Touch on mobile) |
| **Static Export Routing** | Verified in Next Build | Tested & Verified | Pending Capacitor sync |

---

## 2. Test Setup & Prerequisites

1. **Development Server**:
   ```bash
   npm run dev
   ```
   Accessible at `http://localhost:3000`.

2. **Mock Extension Server** (Uses freely licensed Blender Foundation Big Buck Bunny media):
   ```bash
   node scripts/mock-extension.mjs
   ```
   Runs at `http://localhost:3456` with:
   - Manifest: `http://localhost:3456/manifest.json`
   - Streams: `http://localhost:3456/stream/anilist/21/1.json`

---

## 3. Test Suites

### Suite 1: Extension Lifecycle Management

| ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| **TC-1.1** | Install Extension via Manifest | Navigate to `/extensions`. Paste `http://localhost:3456`. Click "Fetch Manifest". Click "Install Extension". | Manifest is fetched, previewed with name, version, description, and added to the installed list. First-install notice modal appears. | **PASS** |
| **TC-1.2** | Legal Notice Acknowledgement | Click "I Understand & Accept" on first install. | Notice modal closes. Preference `kamui_ext_notice_acknowledged` saved in `localStorage`. Modal does not reappear on subsequent installs. | **PASS** |
| **TC-1.3** | Disable & Enable Extension | Click the power toggle switch on an installed extension card. | Extension status changes to "Disabled". Streams from this extension are excluded from playback without removing the extension. Re-enabling restores streams. | **PASS** |
| **TC-1.4** | Reorder Extensions | When 2+ extensions are installed, click the Up/Down arrow buttons. | Extensions change display order and search priority order in `localStorage` (`order` index). | **PASS** |
| **TC-1.5** | Remove Extension | Click the red trash icon and confirm deletion. | Extension is removed from `kamui_installed_extensions_v1`. Playback switches to remaining extensions or locks if zero extensions remain. | **PASS** |
| **TC-1.6** | Duplicate Installation Prevention | Attempt to install `http://localhost:3456` again. | UI displays warning: extension ID already exists. Prevents duplicate storage entries. | **PASS** |

---

### Suite 2: Security, URL Validation & Error Handling

| ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| **TC-2.1** | Insecure Public HTTP Rejection | Enter `http://example.com` on `/extensions`. Click "Fetch Manifest". | Validation error: Insecure public HTTP rejected. Production URLs must use HTTPS. | **PASS** |
| **TC-2.2** | Dangerous Schemes Blocked | Attempt to install `javascript:alert(1)`, `data:text/html,...`, or `file:///etc/passwd`. | Input validation immediately flags URL as invalid. No network request is dispatched. | **PASS** |
| **TC-2.3** | Embedded Credentials Rejection | Attempt to install `https://user:pass@provider.com`. | Rejected: URLs with embedded credentials are prohibited to prevent credential leaks. | **PASS** |
| **TC-2.4** | HTTP Redirect Rejection (Fail-Closed) | Query an extension endpoint that returns an HTTP `301` or `302` redirect. | Browser fetch rejects with `redirect: 'error'`. Error is surfaced: *"HTTP redirects are blocked for security: Extension endpoints must return direct JSON responses."* | **PASS** |
| **TC-2.5** | Malformed JSON & HTML Error Pages | Point extension URL to a page returning HTML 404/500 or broken JSON. | Error message: *"Invalid response format: Expected application/json"* or controlled parse error. Application does not crash. | **PASS** |
| **TC-2.6** | Oversized Payload (> 1 MiB) | Query an extension returning payload > 1,048,576 bytes. | Request stream reader is aborted/cancelled. Error: *"Response exceeds maximum size limit of 1MB."* | **PASS** |
| **TC-2.7** | Offline Server / Network Timeout | Enter `http://localhost:9999` (non-existent server) or simulate delay > 8 seconds. | Request aborts after 8 seconds. Error: *"Request timed out after 8 seconds."* or connection error reported cleanly per extension. | **PASS** |
| **TC-2.8** | XSS & Script Content Stripping | Manifest contains `<script>alert(1)</script>Name` or `<b>Bold</b>`. | Text is sanitized via `sanitizePlainText`. Inner script tags are completely eradicated; bold tags stripped; renders safely as plain text. | **PASS** |

---

### Suite 3: Multi-Extension Resilience

| ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| **TC-3.1** | Parallel Stream Aggregation | Install 2 enabled extensions (e.g., Extension A and Extension B). Open an episode on `/watch`. | Streams from both extensions are retrieved in parallel and merged into the stream selection list with extension badges. | **PASS** |
| **TC-3.2** | Partial Extension Failure | Extension A responds with streams; Extension B is offline or returns 500 error. | Player displays streams from Extension A without disruption. Stream status badge shows 1 error without breaking playback. | **PASS** |
| **TC-3.3** | Zero Enabled Extensions | Disable all extensions. Open any anime preview. | Play button shows locked icon: *"Install extension to watch"*. Clicking redirects to `/extensions`. | **PASS** |

---

### Suite 4: Video Playback & HLS / MP4 Media Pipeline

| ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| **TC-4.1** | Direct MP4 Playback | Select an HTTP MP4 stream (e.g. Big Buck Bunny 1080p). | Video initializes directly in `<video>` element and starts playback without errors. | **PASS** |
| **TC-4.2** | Adaptive HLS Playback | Select an HLS stream (`.m3u8`). | `hls.js` dynamically loads via code-split `import('hls.js')`. Attaches to media element; adaptive bitrate playback functions. | **PASS** |
| **TC-4.3** | Subtitle Track Selection | Select English or Spanish WebVTT subtitles from the player subtitle dropdown. | Selected track activates (`mode = 'showing'`). Subtitles render over video. Selecting "Subtitles Off" disables them. | **PASS** |
| **TC-4.4** | Stream Fallback on Failure | Simulate a stream error on current source. | Player displays error overlay: *"Stream Playback Failed"*, offers "Try Another Stream" button, and auto-switches to next valid stream. | **PASS** |
| **TC-4.5** | Reserved P2P Type Handling | Extension returns a stream with `type: "p2p"`. | Stream parser flags `isUnsupported: true`. Stream is excluded from active player auto-play and displays "Not supported in this version" notice. | **PASS** |

---

### Suite 5: Keyboard Controls & Focus Isolation

| ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| **TC-5.1** | Video Control Shortcuts | With player open: Press `Space` (Play/Pause), `Left Arrow` (-10s), `Right Arrow` (+10s), `Key F` (Fullscreen), `Escape` (Close). | Respective playback actions execute smoothly. | **PASS** |
| **TC-5.2** | Form Focus Isolation | Click inside the Subtitle `<select>` dropdown or a search `<input>`, then press `Space` or `Arrow Keys`. | Keyboard events are captured by the form control (e.g. changing dropdown option) and **do not** trigger video pause or seek. | **PASS** |

---

### Suite 6: Watch-History & Progress Persistence

| ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| **TC-6.1** | Periodic Progress Saving | Watch an episode for 15+ seconds. Close the player. | Progress is persisted to `localStorage` key `kamui_continue_watching` with `animeId`, `episodeNum`, `currentTime`, `duration`, and percentage. | **PASS** |
| **TC-6.2** | Player Resume Position | Reopen the same anime episode. | Player resumes or continues from the last saved timestamp. | **PASS** |
| **TC-6.3** | Non-Numeric ID Guard | Attempt to call `saveProgress` with a non-numeric or malformed ID (`"custom-slug"`). | Rejected: only valid numeric AniList IDs (`/^\d+$/`) are persisted to prevent corruption. | **PASS** |
| **TC-6.4** | Zero / Negative Timestamp Guard | Call `saveProgress` with duration `0` or negative time. | Safely ignored: prevents division by zero or NaN percentage calculations. | **PASS** |
| **TC-6.5** | Episode Completion vs Start | Watch 0 seconds (just opened) vs 95%+ of duration. | 0 seconds does not mark episode complete. Watching past 90% calculates correct percentage (up to 100%). | **PASS** |

---

### Suite 7: Auto-Advance & Episode Boundaries

| ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| **TC-7.1** | Next Episode Transition | Let video reach `onEnded` for Episode 1 of a multi-episode anime. | Auto-advance triggers, debounce guard (`isAdvancingRef`) prevents duplicate firing, and Episode 2 begins playback. | **PASS** |
| **TC-7.2** | Final Episode Boundary | Let video reach `onEnded` on the final episode (e.g. Episode 24 of 24). | Auto-advance stops at the final episode boundary; does not attempt to play non-existent Episode 25. | **PASS** |

---

### Suite 8: Static Routes & Responsive UI

| ID | Test Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| **TC-8.1** | Static Routes Verification | Load `/`, `/watch`, `/extensions`, `/signin`, `/signup`, `/_not-found`. | All 6 static routes load instantly with zero SSR dependencies or server-side API calls. | **PASS** |
| **TC-8.2** | Mobile Viewport (< 640px) | View `/extensions` and player modal on a narrow mobile viewport (375px width). | Elements stack cleanly, navigation bar shrinks, player controls remain accessible, touch targets >= 44px. | **PASS** |
| **TC-8.3** | Screen Reader Accessibility | Inspect accessibility tree on `/extensions` and video player. | Buttons have descriptive `aria-label`s, modal dialogs declare role, and color contrast meets standards. | **PASS** |

---

## 4. Pending Device & Platform QA (Step 4 Android Scope)

The following items are hardware- or platform-specific and are explicitly marked as **PENDING** until the Capacitor native Android wrapper is added in Step 4:

| Item ID | Description | Reason Pending |
|---|---|---|
| **DEV-1** | Android APK Installation & Launch | Capacitor Android project not yet initialized in repo. |
| **DEV-2** | Native CORS Bypass via `@capacitor/http` | Currently operating under browser CORS policy. |
| **DEV-3** | Hardware Video Decoding & Picture-in-Picture | Requires physical Android device or emulator running WebView. |
| **DEV-4** | Android Back Button Navigation | Requires `@capacitor/app` back button event listener. |
| **DEV-5** | Safe-Area & Notch Insets | Requires native status bar / display cutouts testing. |
