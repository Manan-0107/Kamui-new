export type StreamProtocol = 'hls' | 'mp4' | 'consumet' | 'embed' | 'api';
export type ExtensionStatus = 'online' | 'degraded' | 'offline';

export interface AnimeExtension {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  badge?: string;
  badgeType?: 'official' | 'featured' | 'fast' | 'community' | 'custom';
  streamType: StreamProtocol;
  baseUrl: string;
  repoUrl?: string;
  enabled: boolean;
  isDefault: boolean;
  latencyMs: number;
  status: ExtensionStatus;
  supportedResolutions: string[];
  supportsDub: boolean;
  supportsSub: boolean;
  hasIntroSkip: boolean;
  downloadsEnabled: boolean;
  lastUpdated?: string;
  customHeaders?: Record<string, string>;
}

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  streamType: StreamProtocol;
  baseUrl: string;
  supportedResolutions: string[];
  supportsDub: boolean;
  supportsSub: boolean;
  hasIntroSkip: boolean;
  badge?: string;
}

/**
 * The core app ships with NO content sources or streaming links.
 * Playback is unlocked later by user-installed extensions.
 */
export const DEFAULT_EXTENSIONS: AnimeExtension[] = [];
export const EXTENSION_STORE_CATALOG: AnimeExtension[] = [];
export const SAMPLE_REPOSITORIES: { title: string; url: string; description: string }[] = [];
