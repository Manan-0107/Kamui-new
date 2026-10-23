import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  searchAnime,
  fetchByGenre,
  fetchAnimeById,
  fetchTrending,
  clearAniListCache
} from '@/lib/anilist';

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

describe('AniList Catalog & Metadata Service', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    (global as any).localStorage = mockStorage;
    clearAniListCache();
    vi.restoreAllMocks();
  });

  describe('1. Search Functionality & Query Guards', () => {
    it('returns empty array immediately for empty or whitespace-only search query without network call', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      const emptyResult = await searchAnime('');
      const spaceResult = await searchAnime('   ');

      expect(emptyResult).toEqual([]);
      expect(spaceResult).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns mapped AnimeData when AniList returns search results', async () => {
      const mockGraphQLResponse = {
        data: {
          Page: {
            media: [
              {
                id: 16498,
                title: { romaji: 'Shingeki no Kyojin', english: 'Attack on Titan' },
                description: 'Humans fight against titans.',
                coverImage: { extraLarge: 'https://example.com/cover.jpg', large: 'https://example.com/large.jpg' },
                bannerImage: 'https://example.com/banner.jpg',
                genres: ['Action', 'Fantasy'],
                startDate: { year: 2013 },
                episodes: 25,
                duration: 24,
                averageScore: 85,
                format: 'TV'
              }
            ]
          }
        }
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse
      } as any);

      const results = await searchAnime('Attack on Titan', 1, 10);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('16498');
      expect(results[0].title).toBe('Attack on Titan');
      expect(results[0].genres).toContain('Action');
      // Generated episodes are capped at 24
      expect(results[0].episodes.length).toBe(24);
      expect(results[0].synopsis).toBe('Humans fight against titans.');
    });
  });

  describe('2. Error Resilience & Graceful Fallbacks', () => {
    it('handles API error response gracefully without crashing the app', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      } as any);

      const results = await fetchTrending(1, 10);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    }, 10000);

    it('returns null gracefully when an individual anime query returns error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as any);

      const result = await fetchAnimeById(99999999);
      expect(result).toBeNull();
    });

    it('rejects invalid non-numeric IDs gracefully', async () => {
      const result = await fetchAnimeById('invalid-not-a-number');
      expect(result).toBeNull();
    });
  });

  describe('3. Genre Filtering & Mapping', () => {
    it('queries genre correctly and generates episode metadata with streaming guidance', async () => {
      const mockGenreResponse = {
        data: {
          Page: {
            media: [
              {
                id: 21,
                title: { romaji: 'One Piece', english: 'One Piece' },
                description: 'Pirates adventure across the sea.',
                coverImage: { extraLarge: 'https://example.com/op.jpg' },
                genres: ['Action', 'Adventure'],
                startDate: { year: 1999 },
                episodes: 2,
                averageScore: 88,
                format: 'TV'
              }
            ]
          }
        }
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockGenreResponse
      } as any);

      const items = await fetchByGenre('Action', 1, 5);
      expect(items.length).toBe(1);
      expect(items[0].title).toBe('One Piece');
      expect(items[0].episodes.length).toBe(2);
      expect(items[0].episodes[0].desc).toContain('Install a streaming extension to watch');
    });
  });
});
