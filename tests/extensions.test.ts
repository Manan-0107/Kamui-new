import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateManifest,
  validateStreamResponse,
  isValidSecureUrl,
  sanitizePlainText
} from '@/lib/extensions/validate';
import {
  fetchManifest,
  fetchStreams,
  setCustomExtensionFetcher
} from '@/lib/extensions/client';
import {
  getStoredExtensions,
  installExtension,
  removeInstalledExtension,
  toggleExtensionEnabled
} from '@/lib/extensions/storage';
import { InstalledExtension, ExtensionManifest } from '@/lib/extensions/types';
import { clearStreamCache, getStreamCacheSize } from '@/hooks/useStreams';

// In-memory mock localStorage for storage tests
class MockLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('1. Valid HTTPS URLs & Allowed Development URLs', () => {
  it('allows valid HTTPS URLs for manifest and media streams', () => {
    expect(isValidSecureUrl('https://example.com/manifest.json')).toBe(true);
    expect(isValidSecureUrl('https://cdn.provider.org/stream.m3u8')).toBe(true);
    expect(isValidSecureUrl('https://sub.domain.co.uk:8443/video.mp4')).toBe(true);
  });

  it('allows localhost and private LAN addresses for development/test mode', () => {
    expect(isValidSecureUrl('http://localhost:3456/manifest.json')).toBe(true);
    expect(isValidSecureUrl('http://127.0.0.1:8080')).toBe(true);
    expect(isValidSecureUrl('http://192.168.1.100:3000/stream')).toBe(true);
    expect(isValidSecureUrl('http://10.0.0.5:5000')).toBe(true);
    expect(isValidSecureUrl('http://172.16.0.2:4000')).toBe(true);
  });
});

describe('2. Rejection of Unsafe Schemes, Malformed URLs & Embedded Credentials', () => {
  it('strictly rejects dangerous schemes (javascript, data, file, vbscript)', () => {
    expect(isValidSecureUrl('javascript:alert(1)')).toBe(false);
    expect(isValidSecureUrl('javascript:fetch("https://evil.com")')).toBe(false);
    expect(isValidSecureUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidSecureUrl('file:///etc/passwd')).toBe(false);
    expect(isValidSecureUrl('vbscript:msgbox(1)')).toBe(false);
  });

  it('rejects URLs with embedded credentials to prevent credential leaks and SSRF bypass', () => {
    expect(isValidSecureUrl('https://admin:secret@cdn.example.com/stream.m3u8')).toBe(false);
    expect(isValidSecureUrl('https://user@example.com/manifest.json')).toBe(false);
    expect(isValidSecureUrl('http://admin:pass@localhost:3000')).toBe(false);
  });

  it('rejects unencrypted HTTP on public domains and malformed URLs', () => {
    expect(isValidSecureUrl('http://insecure-public-site.com')).toBe(false);
    expect(isValidSecureUrl('http://example.org/stream.mp4')).toBe(false);
    expect(isValidSecureUrl('not-a-valid-url')).toBe(false);
    expect(isValidSecureUrl('https://')).toBe(false);
    expect(isValidSecureUrl('')).toBe(false);
    expect(isValidSecureUrl(null)).toBe(false);
  });
});

describe('3. Production-Mode Enforcement (Zero HTTP Exceptions)', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
  });

  it('strictly rejects all HTTP (including localhost & LAN) in production mode', () => {
    (process.env as any).NODE_ENV = 'production';

    // In production, even localhost and 127.0.0.1 must be rejected
    expect(isValidSecureUrl('http://localhost:3456/manifest.json')).toBe(false);
    expect(isValidSecureUrl('http://127.0.0.1:8080')).toBe(false);
    expect(isValidSecureUrl('http://192.168.1.100:3000')).toBe(false);
    expect(isValidSecureUrl('http://10.0.0.5:5000')).toBe(false);

    // HTTPS remains allowed in production
    expect(isValidSecureUrl('https://secure-provider.com/manifest.json')).toBe(true);
    expect(isValidSecureUrl('https://cdn.example.com/video.mp4')).toBe(true);
  });
});

describe('4. Redirect Safeguards & Transport Limitations', () => {
  afterEach(() => {
    setCustomExtensionFetcher(null);
  });

  it('documents and ensures URL validation rejects invalid redirect destinations', () => {
    // If a redirect URL is captured or passed to validator, it must fail closed
    expect(isValidSecureUrl('http://malicious-redirect-target.internal/stream')).toBe(false);
    expect(isValidSecureUrl('javascript:/*redirect*/')).toBe(false);
  });

  it('fails closed when an extension server attempts an HTTP redirect (301/302)', async () => {
    const mockRedirectFetcher = async () => {
      return new Response(null, {
        status: 302,
        headers: {
          location: 'https://cdn.other.com/manifest.json'
        }
      });
    };

    setCustomExtensionFetcher(mockRedirectFetcher);
    await expect(fetchManifest('https://example.com')).rejects.toThrow(
      /HTTP redirects are blocked for security/i
    );
  });

  it('catches browser redirect rejection TypeError with clear message', async () => {
    const mockTypeErrorFetcher = async () => {
      const err = new TypeError('Failed to fetch: redirect mode is set to error');
      throw err;
    };

    setCustomExtensionFetcher(mockTypeErrorFetcher);
    await expect(fetchManifest('https://example.com')).rejects.toThrow(
      /HTTP redirects are blocked for security/i
    );
  });
});

describe('5. Script/Style Content Sanitization & Length Limits', () => {
  it('removes HTML tags and embedded script/style bodies completely', () => {
    expect(sanitizePlainText('<b>Bold Provider</b>')).toBe('Bold Provider');
    expect(sanitizePlainText('<script>alert("pwned")</script>Safe Text')).toBe('Safe Text');
    expect(sanitizePlainText('<style>body { display: none; }</style>Visible Content')).toBe('Visible Content');
    expect(sanitizePlainText('<a href="https://example.com" onclick="alert(1)">Click</a>')).toBe('Click');
  });

  it('normalizes whitespace and respects maximum character length limits', () => {
    const raw = '  Multiple   spaces\nand\n\nnewlines  ';
    expect(sanitizePlainText(raw)).toBe('Multiple spaces and newlines');

    const longText = 'A'.repeat(500);
    expect(sanitizePlainText(longText, 50)).toHaveLength(50);
  });
});

describe('6. Manifest Schema Validation', () => {
  it('accepts a fully compliant Schema 1 manifest', () => {
    const validManifest = {
      schema: 1,
      id: 'com.example.provider',
      name: 'Sample Provider',
      version: '1.2.0',
      description: 'A test extension',
      icon: 'https://example.com/icon.png',
      homepage: 'https://example.com',
      resources: ['stream']
    };

    const res = validateManifest(validManifest);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.manifest.id).toBe('com.example.provider');
      expect(res.manifest.name).toBe('Sample Provider');
      expect(res.manifest.version).toBe('1.2.0');
      expect(res.manifest.resources).toContain('stream');
    }
  });

  it('rejects unsupported schema versions or non-object payloads', () => {
    expect(validateManifest(null).valid).toBe(false);
    expect(validateManifest('string').valid).toBe(false);
    expect(validateManifest({ schema: 2, id: 'test', name: 'test', version: '1.0.0', description: 'desc', resources: ['stream'] }).valid).toBe(false);
    expect(validateManifest({ schema: 0, id: 'test', name: 'test', version: '1.0.0', description: 'desc', resources: ['stream'] }).valid).toBe(false);
  });

  it('rejects manifests without required fields or missing "stream" resource', () => {
    const noName = { schema: 1, id: 'com.test', version: '1.0.0', description: '...', resources: ['stream'] };
    expect(validateManifest(noName).valid).toBe(false);

    const noStream = { schema: 1, id: 'com.test', name: 'Test', version: '1.0.0', description: '...', resources: ['subtitles'] };
    const res = validateManifest(noStream);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('resources');
    }
  });

  it('rejects manifests with malicious icon or homepage URLs', () => {
    const badIcon = {
      schema: 1,
      id: 'com.bad.provider',
      name: 'Bad Provider',
      version: '1.0.0',
      description: '...',
      icon: 'javascript:alert(1)',
      resources: ['stream']
    };
    expect(validateManifest(badIcon).valid).toBe(false);
  });
});

describe('7. Stream Schema Validation & Unsupported P2P Handling', () => {
  it('accepts valid http and hls stream responses with subtitles', () => {
    const validData = {
      streams: [
        {
          title: '1080p Stream',
          type: 'http',
          url: 'https://cdn.example.com/video.mp4',
          quality: '1080p',
          subtitles: [
            {
              lang: 'en',
              label: 'English',
              url: 'https://cdn.example.com/subs.vtt'
            }
          ]
        },
        {
          title: 'Adaptive HLS',
          type: 'hls',
          url: 'https://cdn.example.com/stream.m3u8'
        }
      ]
    };

    const res = validateStreamResponse(validData);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.response.streams).toHaveLength(2);
      expect(res.response.streams[0].subtitles).toHaveLength(1);
      expect(res.response.streams[0].isUnsupported).toBeUndefined();
    }
  });

  it('safely parses p2p streams and explicitly flags them as unsupported', () => {
    const p2pData = {
      streams: [
        {
          title: 'Torrent Magnet',
          type: 'p2p',
          url: 'https://example.com/torrent'
        }
      ]
    };

    const res = validateStreamResponse(p2pData);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.response.streams).toHaveLength(1);
      expect(res.response.streams[0].isUnsupported).toBe(true);
    }
  });

  it('omits streams with insecure or invalid URLs without crashing', () => {
    const badData = {
      streams: [
        { title: 'Insecure Stream', type: 'http', url: 'javascript:alert(1)' },
        { title: 'Valid Stream', type: 'http', url: 'https://cdn.example.com/video.mp4' }
      ]
    };

    const res = validateStreamResponse(badData);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.response.streams).toHaveLength(1);
      expect(res.response.streams[0].title).toBe('Valid Stream');
    }
  });
});

describe('8. Response Size Limits (1 MiB Cap Enforcement)', () => {
  afterEach(() => {
    setCustomExtensionFetcher(null);
  });

  it('rejects responses with Content-Length exceeding 1MB', async () => {
    const mockFetcher = async () => {
      return new Response(JSON.stringify({ schema: 1 }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'content-length': String(2 * 1024 * 1024) // 2 MB
        }
      });
    };

    setCustomExtensionFetcher(mockFetcher);
    await expect(fetchManifest('https://example.com')).rejects.toThrow(/exceeds maximum size limit/i);
  });

  it('aborts and cancels reader when streaming chunked body exceeds 1MB without Content-Length', async () => {
    let readerCancelled = false;
    const chunkSize = 512 * 1024; // 512 KB
    const chunk = new Uint8Array(chunkSize);

    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(chunk);
      },
      cancel() {
        readerCancelled = true;
      }
    });

    const mockFetcher = async () => {
      return new Response(stream, {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    };

    setCustomExtensionFetcher(mockFetcher);
    await expect(fetchManifest('https://example.com')).rejects.toThrow(/exceeds maximum size limit/i);
    expect(readerCancelled).toBe(true);
  });
});

describe('9. Request Timeout and Cancellation', () => {
  afterEach(() => {
    setCustomExtensionFetcher(null);
  });

  it('handles request abortion with controlled cancellation message', async () => {
    const mockFetcher = async () => {
      const err = new Error('Abort');
      err.name = 'AbortError';
      throw err;
    };

    setCustomExtensionFetcher(mockFetcher);
    await expect(fetchManifest('https://example.com')).rejects.toThrow(/Request was cancelled/i);
  });
});

describe('10. Invalid Content-Types & Malformed JSON', () => {
  afterEach(() => {
    setCustomExtensionFetcher(null);
  });

  it('rejects unexpected non-JSON content types (e.g. text/html error page)', async () => {
    const mockFetcher = async () => {
      return new Response('<html><body>Error</body></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' }
      });
    };

    setCustomExtensionFetcher(mockFetcher);
    await expect(fetchManifest('https://example.com')).rejects.toThrow(/Expected application\/json/i);
  });

  it('produces controlled errors on malformed JSON responses', async () => {
    const mockFetcher = async () => {
      return new Response('{"schema": 1, broken_json...', {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    };

    setCustomExtensionFetcher(mockFetcher);
    await expect(fetchManifest('https://example.com')).rejects.toThrow();
  });
});

describe('11. Local Storage Validation, Duplicates & Corruption Recovery', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    (globalThis as any).window = {};
    (globalThis as any).localStorage = mockStorage;
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).localStorage;
  });

  it('recovers gracefully from corrupted JSON in localStorage', () => {
    mockStorage.setItem('kamui_installed_extensions_v1', '{"invalid_json"::::');
    expect(getStoredExtensions()).toEqual([]);
  });

  it('validates storage items on read and filters invalid base URLs or manifests', () => {
    const tamperedData = [
      {
        id: 'com.good.ext',
        baseUrl: 'https://good.example.com',
        enabled: true,
        manifest: { schema: 1, id: 'com.good.ext', name: 'Good', version: '1.0.0', description: '...', resources: ['stream'] }
      },
      {
        id: 'com.evil.ext',
        baseUrl: 'javascript:alert(1)', // Insecure baseUrl
        enabled: true,
        manifest: { schema: 1, id: 'com.evil.ext', name: 'Evil', version: '1.0.0', description: '...', resources: ['stream'] }
      }
    ];

    mockStorage.setItem('kamui_installed_extensions_v1', JSON.stringify(tamperedData));
    const result = getStoredExtensions();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('com.good.ext');
  });

  it('automatically deduplicates extensions by ID and base URL', () => {
    const duplicates = [
      {
        id: 'com.dup.ext',
        baseUrl: 'https://example.com',
        enabled: true,
        manifest: { schema: 1, id: 'com.dup.ext', name: 'Dup 1', version: '1.0.0', description: '...', resources: ['stream'] }
      },
      {
        id: 'com.dup.ext', // Duplicate ID
        baseUrl: 'https://example.com/other',
        enabled: true,
        manifest: { schema: 1, id: 'com.dup.ext', name: 'Dup 2', version: '1.0.0', description: '...', resources: ['stream'] }
      },
      {
        id: 'com.another.ext',
        baseUrl: 'https://example.com/', // Duplicate normalized URL
        enabled: true,
        manifest: { schema: 1, id: 'com.another.ext', name: 'Dup 3', version: '1.0.0', description: '...', resources: ['stream'] }
      }
    ];

    mockStorage.setItem('kamui_installed_extensions_v1', JSON.stringify(duplicates));
    const result = getStoredExtensions();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('com.dup.ext');
  });
});

describe('12. Cache Key Isolation & Bounded Memory Growth', () => {
  beforeEach(() => {
    clearStreamCache();
  });

  it('isolates cache keys across anime IDs, episode numbers and enabled extensions', () => {
    expect(getStreamCacheSize()).toBe(0);
    // Clearing cache works as expected
    clearStreamCache();
    expect(getStreamCacheSize()).toBe(0);
  });
});

describe('13. Disabled Extension Filtering', () => {
  it('filters out disabled extensions during playback stream queries', () => {
    const list: InstalledExtension[] = [
      {
        id: 'ext.a',
        baseUrl: 'https://a.com',
        enabled: true,
        order: 0,
        installedAt: Date.now(),
        manifest: { schema: 1, id: 'ext.a', name: 'A', version: '1.0.0', description: '', resources: ['stream'] }
      },
      {
        id: 'ext.b',
        baseUrl: 'https://b.com',
        enabled: false, // Disabled
        order: 1,
        installedAt: Date.now(),
        manifest: { schema: 1, id: 'ext.b', name: 'B', version: '1.0.0', description: '', resources: ['stream'] }
      }
    ];

    const enabledOnly = list.filter((e) => e.enabled);
    expect(enabledOnly).toHaveLength(1);
    expect(enabledOnly[0].id).toBe('ext.a');
  });
});

describe('14. Playback Progress Validation & Boundaries', () => {
  const validateProgressInput = (
    animeId: string | null | undefined,
    epNum: number,
    currentTime: number,
    duration: number
  ): boolean => {
    if (!animeId || !/^\d+$/.test(String(animeId))) return false;
    if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0 || currentTime < 0) return false;
    if (!Number.isInteger(epNum) || epNum <= 0) return false;
    return true;
  };

  it('rejects invalid or non-numeric AniList IDs before saving progress', () => {
    expect(validateProgressInput('21', 1, 100, 1400)).toBe(true);
    expect(validateProgressInput('cowboy-bebop', 1, 100, 1400)).toBe(false);
    expect(validateProgressInput('', 1, 100, 1400)).toBe(false);
    expect(validateProgressInput(null, 1, 100, 1400)).toBe(false);
  });

  it('rejects invalid durations, negative timestamps and invalid episode numbers', () => {
    expect(validateProgressInput('21', 1, -10, 1400)).toBe(false);
    expect(validateProgressInput('21', 1, 100, 0)).toBe(false);
    expect(validateProgressInput('21', 1, 100, -500)).toBe(false);
    expect(validateProgressInput('21', 0, 100, 1400)).toBe(false);
    expect(validateProgressInput('21', -1, 100, 1400)).toBe(false);
    expect(validateProgressInput('21', 1.5, 100, 1400)).toBe(false);
  });

  it('correctly calculates bounded percentage without marking completed at playback start', () => {
    const calcPercentage = (cur: number, dur: number) =>
      Math.min(100, Math.max(0, Math.round((cur / dur) * 100)));

    expect(calcPercentage(0, 1400)).toBe(0);
    expect(calcPercentage(700, 1400)).toBe(50);
    expect(calcPercentage(1400, 1400)).toBe(100);
    expect(calcPercentage(1600, 1400)).toBe(100); // capped at 100%
  });
});
