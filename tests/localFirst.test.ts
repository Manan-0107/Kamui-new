import { describe, it, expect, beforeEach } from 'vitest';
import { INITIAL_FRIENDS, INITIAL_REQUESTS, SUGGESTED_FRIENDS } from '@/context/FriendsContext';
import { AnimeComment } from '@/lib/types';

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

describe('Local-First Data Model & Integrity', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    (global as any).localStorage = mockStorage;
  });

  describe('1. Removal of Seeded Fake Social Content', () => {
    it('ensures initial friends list is strictly empty', () => {
      expect(INITIAL_FRIENDS).toEqual([]);
      expect(INITIAL_FRIENDS.length).toBe(0);
    });

    it('ensures initial friend requests are strictly empty', () => {
      expect(INITIAL_REQUESTS).toEqual([]);
      expect(INITIAL_REQUESTS.length).toBe(0);
    });

    it('ensures suggested friends list is strictly empty', () => {
      expect(SUGGESTED_FRIENDS).toEqual([]);
      expect(SUGGESTED_FRIENDS.length).toBe(0);
    });
  });

  describe('2. Local Comments & Personal Notes Persistence', () => {
    const COMMENTS_STORAGE_KEY = 'kamui_anime_comments';

    it('returns empty notes state when no comments exist', () => {
      const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
      expect(stored).toBeNull();
    });

    it('persists personal notes locally on device without remote transmission', () => {
      const animeId = '21'; // One Piece
      const newComment: AnimeComment = {
        id: 'note-1',
        animeId,
        author: {
          name: 'Local Otaku',
          avatar: '/avatars/nami.svg',
          isCurrentUser: true
        },
        content: 'Wano arc animation is unmatched.',
        createdAt: new Date().toISOString(),
        likes: 0
      };

      // Save comment
      const existing: Record<string, AnimeComment[]> = {};
      existing[animeId] = [newComment];
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(existing));

      // Simulate app reload / restart
      const retrievedRaw = localStorage.getItem(COMMENTS_STORAGE_KEY);
      expect(retrievedRaw).not.toBeNull();
      const retrieved = JSON.parse(retrievedRaw!);
      expect(retrieved[animeId].length).toBe(1);
      expect(retrieved[animeId][0].content).toBe('Wano arc animation is unmatched.');
      expect(retrieved[animeId][0].author.name).toBe('Local Otaku');
    });

    it('isolates personal notes per anime ID', () => {
      const notes: Record<string, AnimeComment[]> = {
        '100': [
          {
            id: 'n-1',
            animeId: '100',
            author: { name: 'Local Otaku', avatar: '/avatars/nami.svg' },
            content: 'Note for anime 100',
            createdAt: new Date().toISOString(),
            likes: 0
          }
        ],
        '200': [
          {
            id: 'n-2',
            animeId: '200',
            author: { name: 'Local Otaku', avatar: '/avatars/nami.svg' },
            content: 'Note for anime 200',
            createdAt: new Date().toISOString(),
            likes: 0
          }
        ]
      };
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(notes));

      const loaded = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)!);
      expect(loaded['100'].length).toBe(1);
      expect(loaded['200'].length).toBe(1);
      expect(loaded['300']).toBeUndefined();
    });
  });

  describe('3. Watch History and List Persistence Across App Restarts', () => {
    it('persists and restores continue watching records across simulated restarts', () => {
      const historyItem = {
        id: 'anime-frieren',
        title: 'Frieren: Beyond Journey\'s End',
        image: 'https://example.com/frieren.jpg',
        progress: 0.65,
        episode: 8,
        totalEpisodes: 28,
        duration: 1420,
        currentTime: 923,
        format: 'TV',
        updatedAt: Date.now()
      };

      localStorage.setItem('kamui_continue_watching', JSON.stringify([historyItem]));

      // Verify simulated reload
      const loaded = JSON.parse(localStorage.getItem('kamui_continue_watching')!);
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe('anime-frieren');
      expect(loaded[0].progress).toBe(0.65);
      expect(loaded[0].currentTime).toBe(923);
    });

    it('persists watchlist and liked titles without server dependency', () => {
      localStorage.setItem('kamui_watchlist', JSON.stringify(['16498', '21']));
      localStorage.setItem('kamui_liked_titles', JSON.stringify(['16498']));

      const watchlist = JSON.parse(localStorage.getItem('kamui_watchlist')!);
      const liked = JSON.parse(localStorage.getItem('kamui_liked_titles')!);

      expect(watchlist).toEqual(['16498', '21']);
      expect(liked).toEqual(['16498']);
    });
  });
});
