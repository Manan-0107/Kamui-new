import { ExtensionManifest, StreamResponse, QueryStreamParams } from './types';
import { validateManifest, validateStreamResponse, isValidSecureUrl } from './validate';

const TIMEOUT_MS = 8000; // 8 seconds timeout
const MAX_RESPONSE_BYTES = 1024 * 1024; // 1 MB cap

export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

let customFetcher: FetchFunction | null = null;

/**
 * Configure a custom fetcher (for future Capacitor Native HTTP in Step 4)
 */
export function setCustomExtensionFetcher(fetcher: FetchFunction | null): void {
  customFetcher = fetcher;
}

/**
 * Safe HTTP fetch helper enforcing:
 * - 8 second timeout via AbortController
 * - 1MB response size cap
 * - JSON Content-Type validation
 * - Stripping any cookies, user identity, or auth headers
 */
async function safeFetchJson<T>(url: string): Promise<T> {
  if (!isValidSecureUrl(url)) {
    throw new Error(`Insecure or invalid URL rejected: ${url}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const fetchImpl = customFetcher || fetch;

  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      },
      // Strictly omit cookies and credentials to protect user privacy
      credentials: 'omit',
      mode: 'cors',
      cache: 'no-store'
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    // Check Content-Type header
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new Error(`Invalid response format: Expected application/json, received "${contentType}".`);
    }

    // Check Content-Length if present
    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
      throw new Error(`Response exceeds maximum size limit of 1MB (${contentLength} bytes).`);
    }

    // Read response with manual byte counter to enforce 1MB limit even if content-length was omitted
    if (res.body && typeof res.body.getReader === 'function') {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_RESPONSE_BYTES) {
            reader.cancel();
            throw new Error(`Response exceeds maximum size limit of 1MB.`);
          }
          chunks.push(value);
        }
      }

      // Concatenate and decode
      const combined = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      const text = new TextDecoder('utf-8').decode(combined);
      return JSON.parse(text);
    } else {
      // Fallback for environments where body.getReader is unavailable
      const text = await res.text();
      if (text.length > MAX_RESPONSE_BYTES) {
        throw new Error(`Response exceeds maximum size limit of 1MB.`);
      }
      return JSON.parse(text);
    }
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after 8 seconds.`);
    }
    throw err;
  }
}

/**
 * Fetch and validate an extension manifest from <base>/manifest.json
 */
export async function fetchManifest(baseUrl: string): Promise<ExtensionManifest> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const manifestUrl = `${cleanBase}/manifest.json`;

  const data = await safeFetchJson<unknown>(manifestUrl);
  const validation = validateManifest(data);

  if (!validation.valid) {
    throw new Error(`Invalid extension manifest: ${validation.error}`);
  }

  return validation.manifest;
}

/**
 * Fetch and validate streams for a given AniList ID and episode:
 * GET <base>/stream/anilist/<anilistId>/<episodeNumber>.json
 */
export async function fetchStreams(
  baseUrl: string,
  anilistId: number | string,
  episodeNumber: number,
  params?: QueryStreamParams
): Promise<StreamResponse> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = new URL(`${cleanBase}/stream/anilist/${anilistId}/${episodeNumber}.json`);

  if (params?.title) url.searchParams.set('title', params.title);
  if (params?.titleEnglish) url.searchParams.set('titleEnglish', params.titleEnglish);
  if (params?.year) url.searchParams.set('year', String(params.year));
  if (params?.format) url.searchParams.set('format', params.format);

  const data = await safeFetchJson<unknown>(url.toString());
  const validation = validateStreamResponse(data);

  if (!validation.valid) {
    throw new Error(`Invalid stream response: ${validation.error}`);
  }

  return validation.response;
}
