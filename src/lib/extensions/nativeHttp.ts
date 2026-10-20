import { Capacitor, CapacitorHttp, HttpResponse } from '@capacitor/core';
import { isValidSecureUrl } from './validate';
import { setCustomExtensionFetcher } from './client';

export const NATIVE_TIMEOUT_MS = 8000;
export const MAX_RESPONSE_BYTES = 1024 * 1024; // 1 MB
export const MAX_REDIRECT_HOPS = 3;

/**
 * Check if the application is running in an environment where Capacitor native HTTP is supported
 */
export function isNativeHttpAvailable(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

/**
 * Native extension fetcher implementation with strict security controls:
 * 1. Checks initial URL against shared security policy (HTTPS, no credentials, etc.)
 * 2. Uses native HTTP plugin to bypass CORS while strictly prohibiting arbitrary headers or cookies
 * 3. Enforces manual redirect handling (disableRedirects: true) with per-hop destination validation
 * 4. Resolves relative redirects safely against current hop URL
 * 5. Re-validates every redirect destination against isValidSecureUrl
 * 6. Enforces max 3 redirect hops
 * 7. Enforces cumulative 8-second timeout across all hops
 * 8. Enforces 1 MiB response size limit
 * 9. Enforces application/json Content-Type
 */
export async function nativeExtensionFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let currentUrl = typeof input === 'string' ? input : input.toString();

  // Validate initial URL
  if (!isValidSecureUrl(currentUrl)) {
    throw new Error(`Insecure or invalid URL rejected: ${currentUrl}`);
  }

  const startTime = Date.now();
  let hops = 0;

  while (hops <= MAX_REDIRECT_HOPS) {
    const elapsed = Date.now() - startTime;
    const remainingTimeout = Math.max(100, NATIVE_TIMEOUT_MS - elapsed);

    if (elapsed >= NATIVE_TIMEOUT_MS) {
      throw new Error(`Request timed out after 8 seconds.`);
    }

    if (init?.signal?.aborted) {
      throw new Error(`Request was cancelled.`);
    }

    let response: HttpResponse;
    try {
      response = await CapacitorHttp.request({
        url: currentUrl,
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        // Enforce native timeouts
        connectTimeout: remainingTimeout,
        readTimeout: remainingTimeout,
        // Disable automatic native redirect following so we can inspect and validate the Location header per-hop
        disableRedirects: true,
        responseType: 'text'
      });
    } catch (err: any) {
      if (init?.signal?.aborted) {
        throw new Error(`Request was cancelled.`);
      }
      const msg = err?.message || String(err);
      if (/timeout/i.test(msg)) {
        throw new Error(`Request timed out after 8 seconds.`);
      }
      throw new Error(`Native HTTP request failed: ${msg}`);
    }

    // Handle HTTP Redirects (301, 302, 303, 307, 308)
    if (response.status >= 300 && response.status < 400) {
      hops++;
      if (hops > MAX_REDIRECT_HOPS) {
        throw new Error(`Exceeded maximum redirect limit of ${MAX_REDIRECT_HOPS} hops.`);
      }

      // Extract location header (case-insensitive check)
      let locationHeader: string | undefined;
      if (response.headers) {
        for (const [k, v] of Object.entries(response.headers)) {
          if (k.toLowerCase() === 'location') {
            locationHeader = v;
            break;
          }
        }
      }

      if (!locationHeader || !locationHeader.trim()) {
        throw new Error(`Redirect response (HTTP ${response.status}) missing Location header.`);
      }

      // Safely resolve relative redirects against current URL
      let nextUrl: string;
      try {
        nextUrl = new URL(locationHeader.trim(), currentUrl).toString();
      } catch {
        throw new Error(`Malformed redirect Location header: "${locationHeader}"`);
      }

      // Re-validate target URL with strict security policy
      if (!isValidSecureUrl(nextUrl)) {
        throw new Error(
          `Insecure or prohibited redirect destination rejected: ${nextUrl}. Extension redirects must lead to verified HTTPS endpoints.`
        );
      }

      // Follow next hop
      currentUrl = nextUrl;
      continue;
    }

    // Check HTTP status code
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP ${response.status}: Native request failed`);
    }

    // Verify Content-Type
    let contentType = '';
    if (response.headers) {
      for (const [k, v] of Object.entries(response.headers)) {
        if (k.toLowerCase() === 'content-type') {
          contentType = v;
          break;
        }
      }
    }

    if (!contentType.toLowerCase().includes('application/json')) {
      throw new Error(
        `Invalid response format: Expected application/json, received "${contentType}".`
      );
    }

    // Check response size
    const rawData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const byteLength = new TextEncoder().encode(rawData).length;
    if (byteLength > MAX_RESPONSE_BYTES) {
      throw new Error(`Response exceeds maximum size limit of 1MB (${byteLength} bytes).`);
    }

    // Return standard Web Response object for drop-in compatibility
    return new Response(rawData, {
      status: response.status,
      headers: response.headers as any
    });
  }

  throw new Error(`Exceeded maximum redirect limit of ${MAX_REDIRECT_HOPS} hops.`);
}

/**
 * Automatically initialize the native HTTP adapter if running inside Capacitor Android
 */
export function initNativeHttpAdapter(): void {
  if (isNativeHttpAvailable()) {
    setCustomExtensionFetcher(nativeExtensionFetch);
  }
}
