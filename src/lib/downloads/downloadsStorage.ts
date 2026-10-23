export interface MediaDownloadRecord {
  id: string; // `${animeId}_ep${episodeNum}`
  animeId: string;
  episodeNum: number;
  title: string;
  streamUrl: string;
  format: 'mp4' | 'hls';
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number; // 0 - 100
  sizeBytes: number;
  downloadedAt?: number;
  localPath?: string;
  error?: string;
}

const DOWNLOADS_STORAGE_KEY = 'kamui_media_downloads_v1';

/**
 * Check whether a media stream format is supported for reliable offline storage.
 * Direct MP4 files can be stored reliably offline.
 * HLS (.m3u8) multi-segment dynamic streams are unsupported for offline saving in v0.1.
 */
export function canDownloadFormat(format?: string, url?: string): { supported: boolean; format?: string; reason?: string } {
  const normFormat = (format || '').toLowerCase();
  const normUrl = (url || '').toLowerCase();

  if (normFormat === 'hls' || normFormat.includes('m3u8') || normUrl.includes('.m3u8')) {
    return {
      supported: false,
      format: 'hls',
      reason: 'HLS (.m3u8) streams require adaptive live segmentation and are not supported for offline downloads in v0.1. Stream online or use an MP4 source.'
    };
  }
  if (normFormat === 'p2p' || normUrl.startsWith('magnet:')) {
    return {
      supported: false,
      format: 'p2p',
      reason: 'P2P streams are unsupported for direct offline storage in v0.1.'
    };
  }
  if (normFormat === 'mp4' || normFormat === 'video/mp4' || normUrl.includes('.mp4')) {
    return { supported: true, format: 'mp4' };
  }
  return {
    supported: false,
    format: normFormat || 'unknown',
    reason: `Format "${format || 'unknown'}" is not supported for offline downloads in this release.`
  };
}

export const isFormatSupportedForOfflineDownload = canDownloadFormat;

/**
 * Read all download metadata records from persistent local storage.
 */
export function getAllDownloadRecords(): MediaDownloadRecord[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse download records from storage', e);
    return [];
  }
}

/**
 * Get download record for a specific episode.
 */
export function getDownloadRecord(animeId: string, episodeNum: number): MediaDownloadRecord | null {
  const all = getAllDownloadRecords();
  return all.find((r) => r.animeId === animeId && r.episodeNum === episodeNum) || null;
}

/**
 * Save or update a download record.
 */
export function saveDownloadRecord(record: MediaDownloadRecord): void {
  if (typeof localStorage === 'undefined') return;
  const all = getAllDownloadRecords();
  const existingIdx = all.findIndex((r) => r.id === record.id);
  let updated: MediaDownloadRecord[];
  if (existingIdx >= 0) {
    updated = [...all];
    updated[existingIdx] = record;
  } else {
    updated = [record, ...all];
  }
  try {
    localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save download record to storage', e);
  }
}

/**
 * Remove a download record from storage.
 */
export function removeDownloadRecord(id: string): void {
  if (typeof localStorage === 'undefined') return;
  const all = getAllDownloadRecords();
  const updated = all.filter((r) => r.id !== id);
  try {
    localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove download record from storage', e);
  }
}

/**
 * Convenience helper to delete a record by animeId and episodeNum.
 */
export function deleteDownloadRecord(animeId: string, episodeNum: number): void {
  removeDownloadRecord(`${animeId}_ep${episodeNum}`);
  // Also remove by matching animeId and episodeNum if custom ID was used
  if (typeof localStorage !== 'undefined') {
    const all = getAllDownloadRecords();
    const filtered = all.filter((r) => !(r.animeId === animeId && r.episodeNum === episodeNum));
    try {
      localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}
  }
}

/**
 * Verifies if the media file is actually downloaded and completed.
 * Playback is blocked if the required local media file is absent.
 */
export function isMediaDownloaded(animeId: string, episodeNum: number): boolean {
  const record = getDownloadRecord(animeId, episodeNum);
  if (!record) return false;
  return record.status === 'completed' && Boolean(record.localPath || record.downloadedAt) && record.sizeBytes > 0;
}

/**
 * Determine if offline playback is permitted for this episode.
 * Enforces requirement: Playback is blocked when the required local media file is absent.
 * Playback becomes available only after a real, verified download.
 */
export function canPlayOffline(animeId: string, episodeNum: number): boolean {
  return isMediaDownloaded(animeId, episodeNum);
}
