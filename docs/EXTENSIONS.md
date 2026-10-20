# Kamui Declarative HTTP Extension Protocol (Schema 1)

Kamui is an anime catalog application that ships with **no built-in media content sources**. Playback functionality is unlocked exclusively through user-installed declarative extensions.

Kamui enforces a **zero code execution** model: extensions are standard HTTP servers that return JSON metadata. Kamui never executes arbitrary JavaScript or third-party code.

---

## 1. Extension Endpoints

An extension is identified by its base URL (e.g. `https://provider.example.com`). It must implement two endpoints:

### Endpoint A: Manifest
`GET <base>/manifest.json`

Returns metadata describing the extension.

#### Request
- Method: `GET`
- Header: `Accept: application/json`
- Credentials: None (no cookies or tokens sent)

#### Response (`200 OK`)
```json
{
  "schema": 1,
  "id": "com.example.myext",
  "name": "My Extension",
  "version": "1.0.0",
  "description": "Streaming provider for public domain & open anime archives.",
  "icon": "https://provider.example.com/icon.png",
  "homepage": "https://provider.example.com",
  "resources": ["stream"]
}
```

#### Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `schema` | `number` | Yes | Must equal `1`. Other versions will be rejected. |
| `id` | `string` | Yes | Reverse-DNS unique identifier (e.g. `com.example.provider`). |
| `name` | `string` | Yes | Human-readable extension display name. |
| `version` | `string` | Yes | Version string (e.g. `1.0.0`). |
| `description` | `string` | Yes | Plain text description of what this provider does. |
| `icon` | `string` | No | HTTPS URL to a PNG/SVG icon. |
| `homepage` | `string` | No | HTTPS URL to project repository or homepage. |
| `resources` | `string[]` | Yes | Must contain `"stream"`. |

---

### Endpoint B: Streams
`GET <base>/stream/anilist/<anilistId>/<episodeNumber>.json`

Returns available playable streams for a given AniList ID and episode number.

#### URL Parameters
- `anilistId`: Numeric AniList ID (e.g. `21`, `16498`).
- `episodeNumber`: 1-based episode index (e.g. `1`, `2`).

#### Optional Query Parameters
- `title`: Romaji title (e.g. `One Piece`).
- `titleEnglish`: English title (if available).
- `year`: Release year (e.g. `1999`).
- `format`: AniList media format (`TV`, `MOVIE`, `OVA`, etc.).

#### Response (`200 OK`)
```json
{
  "streams": [
    {
      "title": "1080p Master Stream",
      "type": "http",
      "url": "https://cdn.example.com/video/ep1.mp4",
      "quality": "1080p",
      "language": "ja",
      "subtitles": [
        {
          "lang": "en",
          "label": "English",
          "url": "https://cdn.example.com/subs/ep1-en.vtt"
        }
      ]
    },
    {
      "title": "Adaptive HLS Feed",
      "type": "hls",
      "url": "https://cdn.example.com/hls/ep1/master.m3u8",
      "quality": "Adaptive",
      "language": "ja"
    }
  ]
}
```

#### Stream Item Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Stream title displayed in the source picker. |
| `type` | `"http" \| "hls" \| "p2p"` | Yes | Streaming protocol. `"p2p"` is reserved for future steps. |
| `url` | `string` | Yes | Playable media stream URL (`.mp4`, `.m3u8`, etc.). |
| `quality` | `string` | No | Video resolution (e.g. `1080p`, `720p`, `4K`). |
| `language` | `string` | No | Audio language code (e.g. `ja`, `en`). |
| `subtitles` | `SubtitleTrack[]` | No | Optional array of WebVTT subtitle tracks. |

---

## 2. CORS (Cross-Origin Resource Sharing)

Because Kamui executes strictly in client-side WebViews and browsers without intermediate proxy servers, **all extension endpoints must send permissive CORS headers**:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
```

Handle `OPTIONS` preflight requests with `204 No Content`.

---

## 3. Security & Privacy Rules

1. **URL Protocols**: All URLs (`url`, `icon`, `homepage`, and subtitle `url`) must use `https://`. For local development only, `http://localhost` and private LAN addresses (e.g. `192.168.x.x`, `10.x.x.x`) are permitted. Insecure schemes (`javascript:`, `data:`, `file:`) are strictly rejected.
2. **Plain Text Only**: All strings provided by extensions are sanitized and rendered as plain text. HTML markup and inline scripts are stripped.
3. **Zero User Tracking**: Kamui never sends user identity, cookies, authentication headers, or local storage data to extensions. Requests carry only media metadata (`anilistId`, `episodeNumber`, `title`).
4. **Limits**: Responses have an 8-second network timeout and a 1MB payload size cap.
5. **Redirect Policy**: In browser environments, Kamui enforces `redirect: 'error'` to prevent transparent redirects from circumventing URL validation or probing private network resources. Extension endpoints must return direct JSON responses (`200 OK`). If a provider relies on CDN redirects, this requires the upcoming Capacitor native transport adapter (Step 4), where redirect targets can be intercepted, validated, and controlled before navigation occurs.

---

## 4. Local Testing with the Mock Server

To test extension integration locally:

1. Run the dev mock extension:
   ```bash
   node scripts/mock-extension.mjs
   ```
2. Open Kamui at `http://localhost:3000/extensions`.
3. Enter `http://localhost:3456` and click **Fetch Manifest**.
4. Confirm install.
5. Navigate to any anime title on `/watch`: playback is now unlocked!
