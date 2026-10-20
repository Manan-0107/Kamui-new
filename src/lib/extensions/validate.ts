import { ExtensionManifest, StreamResponse, StreamItem, SubtitleTrack } from './types';

/**
 * Validates whether a URL meets strict security requirements:
 * - Must be https:// in production
 * - Allows http:// only for localhost (127.0.0.1, [::1]) and private-LAN IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x) for local dev
 * - Strictly rejects javascript:, data:, file:, vbscript:, and anything else
 */
export function isValidSecureUrl(rawUrl: unknown): boolean {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return false;
  }

  const trimmed = rawUrl.trim();

  // Explicit forbidden scheme checks before URL parsing
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('blob:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);

    // Reject URLs with embedded credentials (e.g. https://user:pass@example.com)
    if (parsed.username || parsed.password) {
      return false;
    }

    // Standard secure HTTPS
    if (parsed.protocol === 'https:') {
      return true;
    }

    // Allow HTTP ONLY in development or test environments for local testing
    const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    if (parsed.protocol === 'http:' && isDevOrTest) {
      const hostname = parsed.hostname.toLowerCase();

      // Standard loopback addresses
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname === '[::1]' ||
        hostname.endsWith('.local')
      ) {
        return true;
      }

      // Check IPv4 private ranges strictly with 4 octets in decimal format (reject hex/octal bypasses)
      const ipParts = hostname.split('.');
      if (ipParts.length === 4 && ipParts.every((p) => /^\d+$/.test(p))) {
        const [a, b, c, d] = ipParts.map((p) => parseInt(p, 10));
        if ([a, b, c, d].every((n) => n >= 0 && n <= 255)) {
          if (a === 127) return true; // Loopback IP range (127.0.0.0/8)
          if (a === 10) return true; // Private LAN 10.0.0.0/8
          if (a === 192 && b === 168) return true; // Private LAN 192.168.0.0/16
          if (a === 172 && b >= 16 && b <= 31) return true; // Private LAN 172.16.0.0/12
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Strip any HTML tags, script/style blocks, or injection attempts to ensure plain text only
 */
export function sanitizePlainText(text: unknown, maxLength = 500): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip script tags and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // strip style tags and their content
    .replace(/<[^>]*>/g, '') // strip any remaining HTML tags
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate manifest schema and fields
 */
export function validateManifest(data: unknown): { valid: true; manifest: ExtensionManifest } | { valid: false; error: string } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Manifest must be a JSON object.' };
  }

  const obj = data as Record<string, any>;

  // Check schema version
  if (obj.schema !== 1) {
    return {
      valid: false,
      error: `Unsupported schema version "${obj.schema}". Kamui supports extension schema version 1.`
    };
  }

  // ID validation: reverse-DNS format (e.g. "com.example.myext" or "org.domain.sub")
  if (typeof obj.id !== 'string' || !/^[a-zA-Z0-9_\-]+(\.[a-zA-Z0-9_\-]+)+$/.test(obj.id.trim())) {
    return {
      valid: false,
      error: 'Manifest "id" must be a unique reverse-DNS identifier (e.g. "com.example.myext").'
    };
  }

  // Name
  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    return { valid: false, error: 'Manifest "name" is required and must be non-empty.' };
  }

  // Version: semver or numeric string
  if (typeof obj.version !== 'string' || !obj.version.trim()) {
    return { valid: false, error: 'Manifest "version" is required.' };
  }

  // Description
  if (typeof obj.description !== 'string') {
    return { valid: false, error: 'Manifest "description" must be a string.' };
  }

  // Optional icon
  if (obj.icon !== undefined) {
    if (!isValidSecureUrl(obj.icon)) {
      return {
        valid: false,
        error: 'Manifest "icon" must be a valid secure URL (HTTPS or local dev URL). Insecure schemes like javascript: or data: are strictly rejected.'
      };
    }
  }

  // Optional homepage
  if (obj.homepage !== undefined) {
    if (!isValidSecureUrl(obj.homepage)) {
      return {
        valid: false,
        error: 'Manifest "homepage" must be a valid secure URL (HTTPS or local dev URL).'
      };
    }
  }

  // Resources: must include "stream"
  if (!Array.isArray(obj.resources) || !obj.resources.includes('stream')) {
    return {
      valid: false,
      error: 'Manifest "resources" array must contain "stream".'
    };
  }

  const manifest: ExtensionManifest = {
    schema: 1,
    id: obj.id.trim(),
    name: sanitizePlainText(obj.name, 80),
    version: sanitizePlainText(obj.version, 20),
    description: sanitizePlainText(obj.description, 400),
    icon: obj.icon ? obj.icon.trim() : undefined,
    homepage: obj.homepage ? obj.homepage.trim() : undefined,
    resources: ['stream']
  };

  return { valid: true, manifest };
}

/**
 * Validate stream response payload
 */
export function validateStreamResponse(data: unknown): { valid: true; response: StreamResponse } | { valid: false; error: string } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Stream response must be a JSON object.' };
  }

  const obj = data as Record<string, any>;

  if (!Array.isArray(obj.streams)) {
    return { valid: false, error: 'Stream response must contain a "streams" array.' };
  }

  const validatedStreams: StreamItem[] = [];

  for (let i = 0; i < obj.streams.length; i++) {
    const item = obj.streams[i];
    if (!item || typeof item !== 'object') {
      continue;
    }

    if (typeof item.title !== 'string' || !item.title.trim()) {
      continue;
    }

    if (!['http', 'hls', 'p2p'].includes(item.type)) {
      continue;
    }

    if (!isValidSecureUrl(item.url)) {
      continue;
    }

    // Subtitles
    const subtitles: SubtitleTrack[] = [];
    if (Array.isArray(item.subtitles)) {
      for (const sub of item.subtitles) {
        if (
          sub &&
          typeof sub.lang === 'string' &&
          typeof sub.label === 'string' &&
          isValidSecureUrl(sub.url)
        ) {
          subtitles.push({
            lang: sanitizePlainText(sub.lang, 10),
            label: sanitizePlainText(sub.label, 40),
            url: sub.url.trim()
          });
        }
      }
    }

    const streamItem: StreamItem = {
      title: sanitizePlainText(item.title, 80),
      type: item.type,
      url: item.url.trim(),
      quality: item.quality ? sanitizePlainText(item.quality, 20) : undefined,
      language: item.language ? sanitizePlainText(item.language, 10) : undefined,
      subtitles: subtitles.length > 0 ? subtitles : undefined,
      isUnsupported: item.type === 'p2p' ? true : undefined // Reserve p2p type as unsupported in this version
    };

    validatedStreams.push(streamItem);
  }

  return {
    valid: true,
    response: {
      streams: validatedStreams
    }
  };
}
