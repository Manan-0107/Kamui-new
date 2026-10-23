import { describe, it, expect, beforeEach } from 'vitest';
import { validateBackup } from '@/lib/backup/validateBackup';
import { importBackup } from '@/lib/backup/importBackup';
import { generateBackupData } from '@/lib/backup/exportBackup';
import {
  createAutoBackupSnapshot,
  getAutoBackupSnapshots,
  MAX_AUTO_GENERATIONS
} from '@/lib/backup/autoBackup';

// Mock localStorage helper
class MockStorage {
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

describe('Local-First Backup & Restore System', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    (global as any).localStorage = mockStorage;
  });

  describe('1. Schema & Security Validation', () => {
    it('accepts a valid v1 backup payload with numeric AniList IDs', () => {
      const validPayload = {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        appVersion: '0.1.0',
        savedAnime: {
          watchlist: ['16498', '21'],
          likedTitles: ['16498'],
          trackerStatus: { '16498': { status: 'watching', progress: 5 } }
        },
        watchHistory: [
          {
            animeId: '16498',
            episodeNum: 1,
            title: 'Attack on Titan',
            episodeTitle: 'To You, in 2000 Years',
            progress: 0.8,
            duration: 1440,
            currentTime: 1152,
            percentage: 80,
            updatedAt: Date.now()
          }
        ],
        localComments: {
          '16498': [
            {
              id: 'c-1',
              author: 'Local Otaku',
              text: 'Incredible opening episode!',
              timestamp: Date.now(),
              animeId: '16498'
            }
          ]
        },
        preferences: {
          themeId: 'kamui-red',
          userProfile: { name: 'Local Otaku', avatar: '/avatars/nami.svg' }
        },
        extensions: [
          {
            id: 'org.example.animestream',
            baseUrl: 'https://example.com/api',
            enabled: true,
            manifest: {
              schema: 1,
              id: 'org.example.animestream',
              name: 'AnimeStream',
              version: '1.0.0',
              description: 'Sample extension',
              resources: ['stream']
            }
          }
        ],
        downloads: [],
        chats: []
      };

      const result = validateBackup(validPayload);
      expect(result.valid).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.summary?.watchlistCount).toBe(2);
      expect(result.summary?.commentsCount).toBe(1);
    });

    it('rejects unsupported schema versions', () => {
      const invalid = { schemaVersion: 2, exportedAt: new Date().toISOString() };
      const result = validateBackup(invalid);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported backup schemaVersion');
    });

    it('rejects non-object or null data', () => {
      expect(validateBackup(null).valid).toBe(false);
      expect(validateBackup('{"invalid": true}').valid).toBe(false);
      expect(validateBackup([1, 2, 3]).valid).toBe(false);
    });

    it('rejects malicious payloads attempting credential or token injection', () => {
      const withTokens = {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        savedAnime: { watchlist: ['16498'], likedTitles: [], trackerStatus: {} },
        accessToken: 'secret_token_123',
        chats: []
      };
      const result = validateBackup(withTokens);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Suspicious credential or token fields');
    });

    it('rejects invalid or unsafe extension URLs in backup', () => {
      const withBadExtension = {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        savedAnime: { watchlist: [], likedTitles: [], trackerStatus: {} },
        watchHistory: [],
        localComments: {},
        extensions: [
          {
            id: 'bad-ext',
            baseUrl: 'javascript:alert(1)',
            enabled: true,
            manifest: { schema: 1, id: 'bad-ext', name: 'Bad', version: '1.0', resources: ['stream'] }
          }
        ],
        chats: []
      };
      const result = validateBackup(withBadExtension);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid or insecure extension baseUrl');
    });
  });

  describe('2. Import Rollback on Invalid Data', () => {
    it('preserves existing data when import validation fails', async () => {
      // Set existing data
      localStorage.setItem('kamui_watchlist', JSON.stringify(['16498']));
      localStorage.setItem('kamui_anime_comments', JSON.stringify({ '16498': [{ id: '1', text: 'My note' }] }));

      const invalidPayload = {
        schemaVersion: 99, // Invalid version
        exportedAt: new Date().toISOString(),
        savedAnime: { watchlist: ['21'] },
        chats: []
      };

      expect(() => importBackup(invalidPayload, { mode: 'replace' })).toThrow();

      // Existing storage MUST be untouched
      const watchlist = JSON.parse(localStorage.getItem('kamui_watchlist')!);
      expect(watchlist).toEqual(['16498']);

      const comments = JSON.parse(localStorage.getItem('kamui_anime_comments')!);
      expect(comments['16498'][0].text).toBe('My note');
    });
  });

  describe('3. Replace vs Merge Import Deduplication', () => {
    beforeEach(() => {
      localStorage.setItem('kamui_watchlist', JSON.stringify(['16498', '21']));
      localStorage.setItem('kamui_liked_titles', JSON.stringify(['16498']));
      localStorage.setItem(
        'kamui_continue_watching',
        JSON.stringify([
          { animeId: '16498', title: 'Attack on Titan', episodeNum: 1, percentage: 50, duration: 1200, currentTime: 600, updatedAt: 1000 }
        ])
      );
      localStorage.setItem(
        'kamui_anime_comments',
        JSON.stringify({
          '16498': [{ id: 'c-1', author: 'Local Otaku', text: 'Existing comment', timestamp: 1000, animeId: '16498' }]
        })
      );
    });

    it('successfully executes replace mode', async () => {
      const newBackup = {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        savedAnime: {
          watchlist: ['1535'],
          likedTitles: ['1535'],
          trackerStatus: {}
        },
        watchHistory: [
          { animeId: '1535', title: 'Death Note', episodeNum: 3, percentage: 90, duration: 1400, currentTime: 1260, updatedAt: 2000 }
        ],
        localComments: {
          '1535': [{ id: 'c-new', author: 'Local Otaku', text: 'Replaced comment', timestamp: 2000, animeId: '1535' }]
        },
        extensions: [],
        downloads: [],
        chats: []
      };

      const result = await importBackup(newBackup, { mode: 'replace' });
      expect(result.success).toBe(true);

      const watchlist = JSON.parse(localStorage.getItem('kamui_watchlist')!);
      expect(watchlist).toEqual(['1535']);

      const history = JSON.parse(localStorage.getItem('kamui_continue_watching')!);
      expect(history.length).toBe(1);
      expect(history[0].animeId).toBe('1535');
    });

    it('successfully executes merge mode with union deduplication', async () => {
      const incomingBackup = {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        savedAnime: {
          watchlist: ['21', '1535'], // '21' duplicate
          likedTitles: ['1535'],
          trackerStatus: {}
        },
        watchHistory: [
          // newer progress for 16498
          { animeId: '16498', title: 'Attack on Titan', episodeNum: 2, percentage: 20, duration: 1200, currentTime: 240, updatedAt: 2500 },
          { animeId: '1535', title: 'Death Note', episodeNum: 1, percentage: 10, duration: 1200, currentTime: 120, updatedAt: 2000 }
        ],
        localComments: {
          '16498': [
            { id: 'c-1', author: 'Local Otaku', text: 'Existing comment', timestamp: 1000, animeId: '16498' }, // Duplicate ID
            { id: 'c-2', author: 'Local Otaku', text: 'Second comment', timestamp: 2000, animeId: '16498' }
          ]
        },
        extensions: [],
        downloads: [],
        chats: []
      };

      const result = await importBackup(incomingBackup, { mode: 'merge' });
      expect(result.success).toBe(true);

      // Watchlist should be union of ['16498', '21'] and ['21', '1535'] -> 3 items
      const watchlist = JSON.parse(localStorage.getItem('kamui_watchlist')!);
      expect(watchlist).toEqual(['16498', '21', '1535']);

      // Comments should deduplicate c-1
      const comments = JSON.parse(localStorage.getItem('kamui_anime_comments')!);
      expect(comments['16498'].length).toBe(2);
      expect(comments['16498'].map((c: any) => c.id)).toEqual(['c-1', 'c-2']);

      // Watch history should take newer update for 16498
      const history = JSON.parse(localStorage.getItem('kamui_continue_watching')!);
      const animeAHist = history.find((h: any) => h.animeId === '16498');
      expect(animeAHist.episodeNum).toBe(2);
      expect(animeAHist.updatedAt).toBe(2500);
    });
  });

  describe('4. Export Sanitization', () => {
    it('creates a clean v1 export without secrets, tokens, or video binaries', () => {
      localStorage.setItem('kamui_watchlist', JSON.stringify(['16498']));
      localStorage.setItem('kamui_anime_comments', JSON.stringify({ '16498': [{ id: 'c-1', text: 'Note' }] }));

      const payload = generateBackupData();
      expect(payload.schemaVersion).toBe(1);
      expect(payload.savedAnime.watchlist).toContain('16498');
      expect((payload as any).accessToken).toBeUndefined();
      expect((payload as any).password).toBeUndefined();
      expect(payload.chats).toEqual([]);
    });
  });

  describe('5. Generational Auto-Backups', () => {
    it('maintains a bounded generational snapshot history', () => {
      localStorage.setItem('kamui_watchlist', JSON.stringify(['16498']));

      // Create snapshots
      for (let i = 1; i <= MAX_AUTO_GENERATIONS + 2; i++) {
        createAutoBackupSnapshot();
      }

      const snapshots = getAutoBackupSnapshots();
      expect(snapshots.length).toBeLessThanOrEqual(MAX_AUTO_GENERATIONS);
      expect(snapshots.length).toBe(MAX_AUTO_GENERATIONS);
    });
  });
});
