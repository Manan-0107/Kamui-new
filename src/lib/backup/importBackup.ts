import { KamuiBackupV1 } from './schema';
import { validateBackup } from './validateBackup';
import { getStoredExtensions } from '@/lib/extensions/storage';
import { AnimeComment, ContinueWatchingItem } from '@/lib/types';
import { saveDownloadRecord } from '@/lib/downloads/downloadsStorage';

export interface ImportOptions {
  mode: 'merge' | 'replace';
}

export interface ImportResult {
  success: boolean;
  mode: 'merge' | 'replace';
  stats: {
    watchlistCount: number;
    likedCount: number;
    historyCount: number;
    commentsCount: number;
    extensionsCount: number;
  };
}

/**
 * Capture an atomic snapshot of all user storage keys for rollback protection.
 */
function captureStorageSnapshot(): Record<string, string | null> {
  if (typeof window === 'undefined') return {};
  const keys = [
    'kamui_watchlist',
    'kamui_liked_titles',
    'kamui_anime_tracker',
    'kamui_subscribed_notifs',
    'kamui_continue_watching',
    'kamui_anime_comments',
    'kamui_realm_theme',
    'kamui_user_profile',
    'kamui_installed_extensions_v1',
    'kamui_media_downloads_v1'
  ];
  const snapshot: Record<string, string | null> = {};
  for (const k of keys) {
    snapshot[k] = localStorage.getItem(k);
  }
  return snapshot;
}

/**
 * Restore an atomic snapshot in the event of an import error.
 */
function restoreStorageSnapshot(snapshot: Record<string, string | null>): void {
  if (typeof window === 'undefined') return;
  for (const [k, v] of Object.entries(snapshot)) {
    if (v === null) {
      localStorage.removeItem(k);
    } else {
      localStorage.setItem(k, v);
    }
  }
}

/**
 * Import and apply a validated backup with transactional rollback safety.
 */
export function importBackup(
  rawBackup: string | object,
  options: ImportOptions = { mode: 'merge' }
): ImportResult {
  let parsed: any;
  if (typeof rawBackup === 'string') {
    try {
      parsed = JSON.parse(rawBackup);
    } catch {
      throw new Error('Import failed: File content is not valid JSON.');
    }
  } else {
    parsed = rawBackup;
  }

  // 1. Validate schema before touching any storage
  const validation = validateBackup(parsed);
  if (!validation.valid || !validation.summary) {
    throw new Error(`Import validation failed: ${validation.error || 'Invalid backup structure'}`);
  }

  const backup = parsed as KamuiBackupV1;
  const snapshot = captureStorageSnapshot();

  try {
    if (options.mode === 'replace') {
      // Direct replace
      localStorage.setItem('kamui_watchlist', JSON.stringify(backup.savedAnime.watchlist || []));
      localStorage.setItem('kamui_liked_titles', JSON.stringify(backup.savedAnime.likedTitles || []));
      localStorage.setItem('kamui_anime_tracker', JSON.stringify(backup.savedAnime.trackerStatus || {}));
      localStorage.setItem('kamui_subscribed_notifs', JSON.stringify(backup.savedAnime.subscribedAnimeIds || []));
      localStorage.setItem('kamui_continue_watching', JSON.stringify(backup.watchHistory || []));
      localStorage.setItem('kamui_anime_comments', JSON.stringify(backup.localComments || {}));

      if (backup.preferences?.themeId) {
        localStorage.setItem('kamui_realm_theme', backup.preferences.themeId);
      }
      if (backup.preferences?.userProfile) {
        localStorage.setItem('kamui_user_profile', JSON.stringify(backup.preferences.userProfile));
      }

      // Replace extensions
      const formattedExts = (backup.extensions || []).map((ext, idx) => ({
        id: ext.id,
        baseUrl: ext.baseUrl,
        enabled: ext.enabled,
        manifest: ext.manifest,
        order: idx,
        installedAt: Date.now()
      }));
      localStorage.setItem('kamui_installed_extensions_v1', JSON.stringify(formattedExts));

      if (backup.downloads && Array.isArray(backup.downloads)) {
        localStorage.setItem('kamui_media_downloads_v1', JSON.stringify(backup.downloads));
      }

      return {
        success: true,
        mode: 'replace',
        stats: {
          watchlistCount: backup.savedAnime.watchlist.length,
          likedCount: backup.savedAnime.likedTitles.length,
          historyCount: backup.watchHistory.length,
          commentsCount: validation.summary.commentsCount,
          extensionsCount: backup.extensions.length
        }
      };
    }

    // Merge mode: Sensible union and duplicate handling
    const readCurrent = <T>(key: string, fallback: T): T => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };

    // 1. Watchlist union
    const currentWatchlist = readCurrent<string[]>('kamui_watchlist', []);
    const mergedWatchlist = Array.from(new Set([...currentWatchlist, ...(backup.savedAnime.watchlist || [])]));
    localStorage.setItem('kamui_watchlist', JSON.stringify(mergedWatchlist));

    // 2. Liked titles union
    const currentLikes = readCurrent<string[]>('kamui_liked_titles', []);
    const mergedLikes = Array.from(new Set([...currentLikes, ...(backup.savedAnime.likedTitles || [])]));
    localStorage.setItem('kamui_liked_titles', JSON.stringify(mergedLikes));

    // 3. Tracker status merge
    const currentTracker = readCurrent<Record<string, any>>('kamui_anime_tracker', {});
    const mergedTracker = { ...currentTracker, ...(backup.savedAnime.trackerStatus || {}) };
    localStorage.setItem('kamui_anime_tracker', JSON.stringify(mergedTracker));

    // 4. Subscribed notifications union
    const currentSubs = readCurrent<string[]>('kamui_subscribed_notifs', []);
    const mergedSubs = Array.from(new Set([...currentSubs, ...(backup.savedAnime.subscribedAnimeIds || [])]));
    localStorage.setItem('kamui_subscribed_notifs', JSON.stringify(mergedSubs));

    // 5. Watch history merge (prefer newer updatedAt per anime)
    const currentHistory = readCurrent<ContinueWatchingItem[]>('kamui_continue_watching', []);
    const historyMap = new Map<string, ContinueWatchingItem>();
    for (const h of currentHistory) {
      historyMap.set(h.animeId, h);
    }
    for (const h of backup.watchHistory || []) {
      const existing = historyMap.get(h.animeId);
      if (!existing || (h.updatedAt && (!existing.updatedAt || h.updatedAt >= existing.updatedAt))) {
        historyMap.set(h.animeId, h);
      }
    }
    const mergedHistory = Array.from(historyMap.values());
    localStorage.setItem('kamui_continue_watching', JSON.stringify(mergedHistory));

    // 6. Comments merge (deduplicate by comment ID)
    const currentComments = readCurrent<Record<string, AnimeComment[]>>('kamui_anime_comments', {});
    const mergedComments: Record<string, AnimeComment[]> = { ...currentComments };
    let totalMergedComments = 0;

    for (const [animeId, importedList] of Object.entries(backup.localComments || {})) {
      const existingList = mergedComments[animeId] || [];
      const commentMap = new Map<string, AnimeComment>();
      for (const c of existingList) commentMap.set(c.id, c);
      for (const c of importedList) {
        if (!commentMap.has(c.id)) {
          commentMap.set(c.id, c);
        }
      }
      mergedComments[animeId] = Array.from(commentMap.values());
    }
    for (const list of Object.values(mergedComments)) {
      totalMergedComments += list.length;
    }
    localStorage.setItem('kamui_anime_comments', JSON.stringify(mergedComments));

    // 7. Extensions merge (deduplicate by id or baseUrl)
    const currentExts = getStoredExtensions();
    const existingExtIds = new Set(currentExts.map((e) => e.id));
    const existingExtUrls = new Set(currentExts.map((e) => e.baseUrl.replace(/\/+$/, '')));
    const mergedExts = [...currentExts];

    for (const ext of backup.extensions || []) {
      const cleanUrl = ext.baseUrl.replace(/\/+$/, '');
      if (!existingExtIds.has(ext.id) && !existingExtUrls.has(cleanUrl)) {
        mergedExts.push({
          id: ext.id,
          baseUrl: ext.baseUrl,
          enabled: ext.enabled,
          manifest: ext.manifest as any,
          order: mergedExts.length,
          installedAt: Date.now()
        });
        existingExtIds.add(ext.id);
        existingExtUrls.add(cleanUrl);
      }
    }
    localStorage.setItem('kamui_installed_extensions_v1', JSON.stringify(mergedExts));

    // 8. Downloads metadata merge
    if (backup.downloads && Array.isArray(backup.downloads)) {
      for (const d of backup.downloads) {
        saveDownloadRecord(d as any);
      }
    }

    return {
      success: true,
      mode: 'merge',
      stats: {
        watchlistCount: mergedWatchlist.length,
        likedCount: mergedLikes.length,
        historyCount: mergedHistory.length,
        commentsCount: totalMergedComments,
        extensionsCount: mergedExts.length
      }
    };
  } catch (err: any) {
    // Transactional rollback on any storage failure
    restoreStorageSnapshot(snapshot);
    throw new Error(`Import failed during storage write: ${err.message}. Previous data was preserved.`);
  }
}
