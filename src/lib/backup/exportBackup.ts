import { KamuiBackupV1, BackupExtensionItem } from './schema';
import { getStoredExtensions } from '@/lib/extensions/storage';
import { getAllDownloadRecords } from '@/lib/downloads/downloadsStorage';

/**
 * Generate a clean, validated JSON backup of user-owned local data.
 * Secrets, credentials, and video binaries are strictly excluded.
 */
export function generateBackupData(): KamuiBackupV1 {
  const hasStorage = typeof localStorage !== 'undefined';
  const isBrowser = typeof window !== 'undefined';

  const readJson = <T>(key: string, fallback: T): T => {
    if (!hasStorage) return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const watchlist = readJson<string[]>('kamui_watchlist', []);
  const likedTitles = readJson<string[]>('kamui_liked_titles', []);
  const trackerStatus = readJson<Record<string, any>>('kamui_anime_tracker', {});
  const subscribedAnimeIds = readJson<string[]>('kamui_subscribed_notifs', []);
  const watchHistory = readJson<any[]>('kamui_continue_watching', []);
  const localComments = readJson<Record<string, any[]>>('kamui_anime_comments', {});
  const themeId = hasStorage ? (localStorage.getItem('kamui_realm_theme') as any) : undefined;
  const userProfile = readJson<any>('kamui_user_profile', {
    name: 'Anime Fan',
    avatar: '/avatars/nami.svg'
  });

  // Export extensions without any sensitive credential headers
  const extensions = getStoredExtensions().map((ext): BackupExtensionItem => ({
    id: ext.id,
    baseUrl: ext.baseUrl,
    enabled: ext.enabled,
    manifest: {
      schema: ext.manifest.schema,
      id: ext.manifest.id,
      name: ext.manifest.name,
      version: ext.manifest.version,
      description: ext.manifest.description,
      resources: ext.manifest.resources
    }
  }));

  // Export download metadata records (not video binaries)
  const downloadRecords = getAllDownloadRecords().map((rec) => ({
    id: rec.id,
    animeId: rec.animeId,
    episodeNum: rec.episodeNum,
    title: rec.title,
    format: rec.format,
    sizeBytes: rec.sizeBytes,
    downloadedAt: rec.downloadedAt || Date.now(),
    status: rec.status
  }));

  const backup: KamuiBackupV1 = {
    schemaVersion: 1,
    appVersion: '0.1.0',
    exportedAt: new Date().toISOString(),
    platform: isBrowser && (window as any).Capacitor?.isNativePlatform() ? 'android' : 'web',
    savedAnime: {
      watchlist,
      likedTitles,
      trackerStatus,
      subscribedAnimeIds
    },
    watchHistory,
    localComments,
    preferences: {
      themeId: themeId || undefined,
      userProfile: {
        name: userProfile.name || 'Anime Fan',
        avatar: userProfile.avatar || '/avatars/nami.svg',
        bio: userProfile.bio,
        socials: userProfile.socials
      }
    },
    extensions,
    downloads: downloadRecords,
    chats: [] // Reserved, empty
  };

  return backup;
}

/**
 * Triggers a download of the backup file in the browser.
 */
export function downloadBackupFile(): { filename: string; sizeBytes: number } {
  const data = generateBackupData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = `kamui-backup-${new Date().toISOString().split('T')[0]}.json`;

  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { filename, sizeBytes: blob.size };
}
