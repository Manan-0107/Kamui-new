import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportListToShareCode,
  validateAndParseList,
  createSharedListPayload,
  importListToWatchlist,
  SharedAnimeListPayload
} from '@/lib/sharing/listSharing';

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

describe('Account-Free List Sharing System', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    (global as any).localStorage = mockStorage;
  });

  const sampleIds = ['16498', '21']; // Attack on Titan, One Piece

  describe('1. File Payload Creation & Validation', () => {
    it('creates a valid SharedAnimeListPayload with privacy guards', () => {
      const payload: SharedAnimeListPayload = createSharedListPayload(
        'Top Shonen Recommendations',
        sampleIds,
        'Curated favorites'
      );
      expect(payload.format).toBe('kamui_anime_list');
      expect(payload.version).toBe(1);
      expect(payload.title).toBe('Top Shonen Recommendations');
      expect(payload.description).toBe('Curated favorites');
      expect(payload.animeIds).toEqual(['16498', '21']);
      // Privacy check: Ensure no user secrets or private notes are included
      expect((payload as any).accessToken).toBeUndefined();
      expect((payload as any).privateNotes).toBeUndefined();
    });

    it('validates a correct payload JSON string', () => {
      const payload = createSharedListPayload('My Favorites', sampleIds);
      const validation = validateAndParseList(JSON.stringify(payload));
      expect(validation.valid).toBe(true);
      expect(validation.payload?.animeIds.length).toBe(2);
      expect(validation.payload?.title).toBe('My Favorites');
    });

    it('rejects an invalid format or corrupted file payload', () => {
      expect(validateAndParseList(null as any).valid).toBe(false);
      expect(validateAndParseList('{"format":"unknown","animeIds":["1"]}').valid).toBe(false);
      expect(validateAndParseList('not-valid-json').valid).toBe(false);
      expect(validateAndParseList('{"format":"kamui_anime_list","version":1,"title":"T","animeIds":[]}').valid).toBe(false);
    });
  });

  describe('2. Compact Base64 Share Codes', () => {
    it('generates a compact share code starting with KM-LIST-', () => {
      const code = exportListToShareCode('Starter Anime', sampleIds);
      expect(code.startsWith('KM-LIST-')).toBe(true);
    });

    it('successfully decodes and validates a generated share code', () => {
      const code = exportListToShareCode('Action List', sampleIds, 'Best fights');
      const result = validateAndParseList(code);
      expect(result.valid).toBe(true);
      expect(result.payload?.title).toBe('Action List');
      expect(result.payload?.animeIds).toEqual(['16498', '21']);
    });

    it('rejects invalid or corrupted share codes gracefully without crashing', () => {
      expect(validateAndParseList('KM-LIST-corrupted!!!base64').valid).toBe(false);
      expect(validateAndParseList('INVALID-CODE').valid).toBe(false);
      expect(validateAndParseList('').valid).toBe(false);
    });
  });

  describe('3. Importing Shared Lists with Duplicate Handling', () => {
    it('merges new items and deduplicates existing watchlist entries', () => {
      // Existing watchlist contains Attack on Titan ('16498') and Death Note ('1535')
      localStorage.setItem('kamui_watchlist', JSON.stringify(['16498', '1535']));

      const incomingIds = ['16498', '21']; // '16498' duplicate, '21' new
      const mergeResult = importListToWatchlist(incomingIds);

      expect(mergeResult.newlyAddedCount).toBe(1); // '21' added
      expect(mergeResult.existingCount).toBe(1); // '16498' was duplicate
      expect(mergeResult.totalWatchlistCount).toBe(3); // 1535, 16498, 21

      const savedWatchlist = JSON.parse(localStorage.getItem('kamui_watchlist')!);
      expect(savedWatchlist).toContain('16498');
      expect(savedWatchlist).toContain('1535');
      expect(savedWatchlist).toContain('21');
    });
  });
});
