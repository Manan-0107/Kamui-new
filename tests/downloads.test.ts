import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveDownloadRecord,
  getDownloadRecord,
  getAllDownloadRecords,
  deleteDownloadRecord,
  isMediaDownloaded,
  canPlayOffline,
  isFormatSupportedForOfflineDownload,
  MediaDownloadRecord
} from '@/lib/downloads/downloadsStorage';

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

describe('Offline Media Downloads & Playback Enforcement', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    (global as any).localStorage = mockStorage;
  });

  describe('1. Offline Format Validation', () => {
    it('supports direct MP4 streams for offline download', () => {
      const check = isFormatSupportedForOfflineDownload('mp4', 'https://example.com/episode.mp4');
      expect(check.supported).toBe(true);
      expect(check.format).toBe('mp4');
    });

    it('explicitly rejects HLS / m3u8 streams as unsupported for offline download', () => {
      const hlsByType = isFormatSupportedForOfflineDownload('hls', 'https://example.com/stream.m3u8');
      expect(hlsByType.supported).toBe(false);
      expect(hlsByType.reason).toContain('HLS (.m3u8) streams require adaptive live segmentation');

      const hlsByUrl = isFormatSupportedForOfflineDownload('http', 'https://example.com/stream.m3u8');
      expect(hlsByUrl.supported).toBe(false);
    });

    it('rejects unsupported p2p streams', () => {
      const p2pCheck = isFormatSupportedForOfflineDownload('p2p', 'magnet:?xt=urn:btih:...');
      expect(p2pCheck.supported).toBe(false);
    });
  });

  describe('2. Local Media Download Storage Records', () => {
    it('stores, retrieves, and lists download records', () => {
      const record: MediaDownloadRecord = {
        id: 'anime-42_ep1',
        animeId: 'anime-42',
        episodeNum: 1,
        title: 'Episode 1',
        streamUrl: 'https://example.com/ep1.mp4',
        format: 'mp4',
        status: 'completed',
        progress: 100,
        sizeBytes: 154200000,
        downloadedAt: Date.now(),
        localPath: 'kamui-media://anime-42/ep-1.mp4'
      };

      saveDownloadRecord(record);

      const retrieved = getDownloadRecord('anime-42', 1);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('anime-42_ep1');
      expect(retrieved?.status).toBe('completed');
      expect(retrieved?.sizeBytes).toBe(154200000);

      const all = getAllDownloadRecords();
      expect(all.length).toBe(1);
    });

    it('deletes a download record correctly', () => {
      const record: MediaDownloadRecord = {
        id: 'anime-99_ep3',
        animeId: 'anime-99',
        episodeNum: 3,
        title: 'Episode 3',
        streamUrl: 'https://example.com/ep3.mp4',
        format: 'mp4',
        status: 'completed',
        progress: 100,
        sizeBytes: 98000000
      };
      saveDownloadRecord(record);
      expect(getDownloadRecord('anime-99', 3)).not.toBeNull();

      deleteDownloadRecord('anime-99', 3);
      expect(getDownloadRecord('anime-99', 3)).toBeNull();
    });
  });

  describe('3. Playback Enforcement when Media is Absent vs Verified', () => {
    it('blocks offline playback when the required local media record is absent', () => {
      // No download record exists for anime 500, episode 1
      const isDownloaded = isMediaDownloaded('500', 1);
      expect(isDownloaded).toBe(false);
      expect(canPlayOffline('500', 1)).toBe(false);
    });

    it('blocks offline playback when download status is still pending or failed', () => {
      const pendingRecord: MediaDownloadRecord = {
        id: 'anime-500_ep1',
        animeId: 'anime-500',
        episodeNum: 1,
        title: 'Episode 1',
        streamUrl: 'https://example.com/ep1.mp4',
        format: 'mp4',
        status: 'pending',
        progress: 25,
        sizeBytes: 0
      };
      saveDownloadRecord(pendingRecord);

      expect(isMediaDownloaded('anime-500', 1)).toBe(false);
      expect(canPlayOffline('anime-500', 1)).toBe(false);

      const failedRecord: MediaDownloadRecord = {
        ...pendingRecord,
        status: 'error',
        error: 'Network timeout'
      };
      saveDownloadRecord(failedRecord);

      expect(isMediaDownloaded('anime-500', 1)).toBe(false);
      expect(canPlayOffline('anime-500', 1)).toBe(false);
    });

    it('permits playback only when verified download status is completed with valid size', () => {
      const completedRecord: MediaDownloadRecord = {
        id: 'anime-500_ep1',
        animeId: 'anime-500',
        episodeNum: 1,
        title: 'Episode 1',
        streamUrl: 'https://example.com/ep1.mp4',
        format: 'mp4',
        status: 'completed',
        progress: 100,
        sizeBytes: 120000000,
        localPath: 'kamui-media://anime-500/ep-1.mp4',
        downloadedAt: Date.now()
      };
      saveDownloadRecord(completedRecord);

      expect(isMediaDownloaded('anime-500', 1)).toBe(true);
      expect(canPlayOffline('anime-500', 1)).toBe(true);
    });
  });
});
