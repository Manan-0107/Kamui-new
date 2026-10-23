# Privacy, Data Storage, & Operational Model (v0.1)

Kamui v0.1 is architected from the ground up as a **local-first, privacy-respecting anime discovery and playback client**.

---

## 1. Local-First Data Storage

### Where User Data Lives
All user data is stored **exclusively on your local device**. There are **no mandatory accounts, no remote user databases, and no cloud backups** in v0.1:
- **Watchlist & Liked Titles:** Stored in device local storage (`kamui_watchlist`, `kamui_liked_titles`).
- **Watch History & Progress:** Stored in device local storage (`kamui_continue_watching`).
- **Personal Notes & Comments:** Stored in device local storage (`kamui_anime_comments`). Comments and notes are **never published or broadcast to other users**.
- **User Preferences & Themes:** Stored locally (`kamui_realm_theme`, `kamui_user_profile`).
- **Installed Extensions:** Stored locally (`kamui_installed_extensions_v1`).
- **Offline Download Metadata:** Stored locally (`kamui_media_downloads_v1`).

### Telemetry & Analytics
- **Zero telemetry:** Kamui does not include Google Analytics, Sentry, Mixpanel, Firebase Analytics, or any tracking SDKs.
- **Zero advertising:** No advertisement SDKs or trackers are bundled with the app.

---

## 2. External Network Communications

Kamui connects only to external services necessary for core functionality:

### 1. AniList Public API (`https://graphql.anilist.co`)
- **Purpose:** Used strictly for fetching anime catalog metadata (trending anime, posters, synopsis, genres, episode lists, and airing schedules).
- **Data Sent:** Search queries and pagination parameters. No personal watch history or user identifiers are ever sent to AniList.
- **Caching:** Responses are cached locally in memory and storage to minimize network requests and respect AniList rate limits (~90 requests/minute).
- **Failure Behavior:** If AniList is unreachable or offline, cached data is served. If no cache exists, an honest offline state is displayed without crashing.

### 2. User-Managed Extensions
- **Purpose:** Resolving stream sources for episode playback.
- **Policy:** Kamui bundles **no default extension scrapers or pre-configured video repositories**. Users add extension endpoint URLs manually.
- **Security:** Extensions are declarative JSON manifests. Arbitrary JavaScript execution is strictly prohibited.
- **Data Sent:** Only anime title and episode identifiers are sent in queries to extension endpoints configured by the user.

---

## 3. Backups & Data Portability

- **Backup Export:** You can export your entire library, history, notes, and extension configurations to a `.json` backup file via the **Backup & Restore** menu.
- **No Secrets Exported:** Backups explicitly strip access tokens, passwords, session cookies, and private credentials. Video binaries are not included in JSON backups.
- **Atomic Rollback:** If an imported backup fails schema validation, existing local data is preserved with an automatic rollback snapshot.
- **Account-Free List Sharing:** You can export recommendations to a `.kamuilist.json` file or generate a compact `KM-LIST-...` share code. These contain only public anime IDs and titles—never personal notes, watch history, or private credentials.

---

## 4. Operational Costs & Infrastructure

- **v0.1 Operational Cost:** **$0.00 / Free**.
  Kamui operates without paid servers, hosted databases, or media delivery networks.
- **Future Services:** Server-backed social features (friends, watch parties, community comments) are deferred. If introduced in future releases, they will remain strictly optional and transparently documented.
