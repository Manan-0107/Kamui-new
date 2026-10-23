import { ContinueWatchingItem, AnimeComment, RealmThemeId, TrackerStatus } from '@/lib/types';

export interface BackupPreferences {
  themeId?: RealmThemeId;
  userProfile?: {
    name: string;
    avatar: string;
    bio?: string;
    socials?: {
      instagram?: string;
      snapchat?: string;
      myanimelist?: string;
      anilist?: string;
      discord?: string;
    };
  };
}

export interface BackupExtensionItem {
  id: string;
  baseUrl: string;
  enabled: boolean;
  manifest: {
    schema: number;
    id: string;
    name: string;
    version: string;
    description?: string;
    resources: string[];
  };
}

export interface BackupDownloadItem {
  id: string;
  animeId: string;
  episodeNum: number;
  title: string;
  format: string;
  sizeBytes: number;
  downloadedAt: number;
  status: string;
}

/**
 * Version 1 Backup Schema for Kamui v0.1
 * Local-first, portable, privacy-preserving.
 * Contains no credentials, tokens, or video files.
 */
export interface KamuiBackupV1 {
  schemaVersion: 1;
  appVersion: string;
  exportedAt: string; // ISO 8601 string
  platform: 'web' | 'android' | 'desktop';
  savedAnime: {
    watchlist: string[];
    likedTitles: string[];
    trackerStatus: Record<string, TrackerStatus>;
    subscribedAnimeIds: string[];
  };
  watchHistory: ContinueWatchingItem[];
  localComments: Record<string, AnimeComment[]>;
  preferences: BackupPreferences;
  extensions: BackupExtensionItem[];
  downloads?: BackupDownloadItem[];
  // Reserved empty array for future social/chat compatibility
  chats: never[];
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  summary?: {
    schemaVersion: number;
    exportedAt: string;
    watchlistCount: number;
    likedCount: number;
    historyCount: number;
    commentsCount: number;
    extensionsCount: number;
  };
}
