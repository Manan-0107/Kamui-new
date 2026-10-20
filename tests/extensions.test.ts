import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateManifest,
  validateStreamResponse,
  isValidSecureUrl,
  sanitizePlainText
} from '@/lib/extensions/validate';

describe('Extension Security & URL Validation', () => {
  it('allows valid HTTPS URLs', () => {
    expect(isValidSecureUrl('https://example.com/manifest.json')).toBe(true);
    expect(isValidSecureUrl('https://cdn.provider.org/stream.m3u8')).toBe(true);
  });

  it('allows localhost and private LAN addresses for development', () => {
    expect(isValidSecureUrl('http://localhost:3456/manifest.json')).toBe(true);
    expect(isValidSecureUrl('http://127.0.0.1:8080')).toBe(true);
    expect(isValidSecureUrl('http://192.168.1.100:3000/stream')).toBe(true);
    expect(isValidSecureUrl('http://10.0.0.5:5000')).toBe(true);
  });

  it('strictly rejects insecure protocols and malicious URL schemes', () => {
    expect(isValidSecureUrl('javascript:alert(1)')).toBe(false);
    expect(isValidSecureUrl('javascript:fetch("https://evil.com")')).toBe(false);
    expect(isValidSecureUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidSecureUrl('file:///etc/passwd')).toBe(false);
    expect(isValidSecureUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isValidSecureUrl('http://insecure-public-site.com')).toBe(false); // HTTP on public domain rejected
    expect(isValidSecureUrl('')).toBe(false);
    expect(isValidSecureUrl(null)).toBe(false);
  });

  it('sanitizes text and removes HTML tags', () => {
    expect(sanitizePlainText('<b>Bold Provider</b>')).toBe('Bold Provider');
    expect(sanitizePlainText('<script>alert(1)</script>Safe Text')).toBe('Safe Text');
    expect(sanitizePlainText('Line 1\n\nLine 2')).toBe('Line 1 Line 2');
  });
});

describe('Manifest Validation', () => {
  it('accepts a valid schema 1 manifest', () => {
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
    }
  });

  it('rejects unsupported schema versions', () => {
    const invalidSchema = {
      schema: 2,
      id: 'com.example.provider',
      name: 'Future Provider',
      version: '1.0.0',
      description: '...',
      resources: ['stream']
    };

    const res = validateManifest(invalidSchema);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('Unsupported schema version');
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

    const res = validateManifest(badIcon);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('icon');
    }
  });

  it('rejects manifests without stream resource', () => {
    const noStream = {
      schema: 1,
      id: 'com.no.stream',
      name: 'No Stream',
      version: '1.0.0',
      description: '...',
      resources: ['subtitles']
    };

    const res = validateManifest(noStream);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('resources');
    }
  });
});

describe('Stream Response Validation', () => {
  it('accepts valid http and hls stream responses', () => {
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
    }
  });

  it('flags reserved p2p streams as unsupported', () => {
    const p2pData = {
      streams: [
        {
          title: 'Torrent Magnet',
          type: 'p2p',
          url: 'https://example.com/info'
        }
      ]
    };

    const res = validateStreamResponse(p2pData);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.response.streams[0].isUnsupported).toBe(true);
    }
  });

  it('rejects streams with javascript: URLs', () => {
    const maliciousStream = {
      streams: [
        {
          title: 'Evil Stream',
          type: 'http',
          url: 'javascript:alert(1)'
        }
      ]
    };

    const res = validateStreamResponse(maliciousStream);
    expect(res.valid).toBe(true);
    if (res.valid) {
      // Stream with invalid url is omitted
      expect(res.response.streams).toHaveLength(0);
    }
  });
});
