export type StreamProtocol = 'hls' | 'mp4' | 'consumet' | 'embed' | 'api';
export type ExtensionStatus = 'online' | 'degraded' | 'offline';

export interface AnimeExtension {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  badge?: string; // e.g. "OFFICIAL", "4K HDR", "FAST CDN", "COMMUNITY"
  badgeType?: 'official' | 'featured' | 'fast' | 'community' | 'custom';
  streamType: StreamProtocol;
  baseUrl: string;
  repoUrl?: string;
  enabled: boolean;
  isDefault: boolean;
  latencyMs: number;
  status: ExtensionStatus;
  supportedResolutions: string[]; // e.g. ['4K', '1080p', '720p']
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

export const DEFAULT_EXTENSIONS: AnimeExtension[] = [];

export const EXTENSION_STORE_CATALOG: AnimeExtension[] = [
  {
    id: 'kamui-origin',
    name: 'Kamui Origin 4K',
    version: 'v3.2.0',
    author: 'Kamui Core Labs',
    description: 'Native ultra-high bitrate master source. Features HDR10+, Dolby Atmos spatial audio, and zero-compression raw Japanese stream feeds.',
    badge: 'OFFICIAL 4K',
    badgeType: 'official',
    streamType: 'hls',
    baseUrl: 'https://stream.kamui.internal/v3/origin/master.m3u8',
    enabled: false,
    isDefault: false,
    latencyMs: 18,
    status: 'online',
    supportedResolutions: ['4K', '1080p', '720p'],
    supportsDub: true,
    supportsSub: true,
    hasIntroSkip: true,
    downloadsEnabled: true,
    lastUpdated: 'Today'
  },
  {
    id: 'hianime-core',
    name: 'HiAnime Stream Engine',
    version: 'v2.4.1',
    author: 'HiAnime Open Source',
    description: 'High-speed cloud cluster offering dual English/Japanese audio tracks, synchronized soft subtitles, and automated intro/outro skip markers.',
    badge: 'POPULAR DUAL-AUDIO',
    badgeType: 'featured',
    streamType: 'hls',
    baseUrl: 'https://cdn.hianime-stream.org/api/v2/stream',
    repoUrl: 'https://github.com/kamui-extensions/hianime-provider',
    enabled: false,
    isDefault: false,
    latencyMs: 34,
    status: 'online',
    supportedResolutions: ['1080p', '720p', '480p'],
    supportsDub: true,
    supportsSub: true,
    hasIntroSkip: true,
    downloadsEnabled: true,
    lastUpdated: 'Yesterday'
  },
  {
    id: 'gogo-cloud',
    name: 'GogoAnime Cloud Mirror',
    version: 'v3.1.0',
    author: 'Gogo CDN Team',
    description: 'Classic high-availability decentralized provider with over 12 global edge CDN nodes. Recommended for older legacy anime and simulcasts.',
    badge: 'FAST CDN',
    badgeType: 'fast',
    streamType: 'mp4',
    baseUrl: 'https://cloud.gogoanime-cdn.net/hls',
    repoUrl: 'https://github.com/kamui-extensions/gogo-mirror',
    enabled: false,
    isDefault: false,
    latencyMs: 42,
    status: 'online',
    supportedResolutions: ['1080p', '720p'],
    supportsDub: true,
    supportsSub: true,
    hasIntroSkip: false,
    downloadsEnabled: true,
    lastUpdated: '3 days ago'
  },
  {
    id: 'animepahe-light',
    name: 'AnimePahe Ultra-Light',
    version: 'v1.9.4',
    author: 'Pahe Re-encodes',
    description: 'Ultra-efficient H.265 (HEVC) high-compression streams. Minimal buffering, designed specifically for mobile data and low-bandwidth connections.',
    badge: 'LOW BANDWIDTH',
    badgeType: 'fast',
    streamType: 'hls',
    baseUrl: 'https://pahe.stream-node.io/hevc',
    enabled: false,
    isDefault: false,
    latencyMs: 29,
    status: 'online',
    supportedResolutions: ['1080p', '720p', '360p'],
    supportsDub: false,
    supportsSub: true,
    hasIntroSkip: true,
    downloadsEnabled: true,
    lastUpdated: '1 week ago'
  },
  {
    id: 'consumet-aggregator',
    name: 'Consumet Universal Provider',
    version: 'v1.8.0',
    author: 'Consumet Org',
    description: 'Unified anime API gateway that dynamically scrapes and aggregates 6+ public mirrors (Zoro, Enime, AnimeFox, Bilibili) with automatic failover.',
    badge: 'MULTI-MIRROR',
    badgeType: 'community',
    streamType: 'consumet',
    baseUrl: 'https://api.consumet.org/anime',
    repoUrl: 'https://github.com/consumet/consumet.ts',
    enabled: false,
    isDefault: false,
    latencyMs: 58,
    status: 'online',
    supportedResolutions: ['1080p', '720p', '480p'],
    supportsDub: true,
    supportsSub: true,
    hasIntroSkip: true,
    downloadsEnabled: false,
    lastUpdated: '2 days ago'
  },
  {
    id: 'zoro-cloud-hd',
    name: 'Zoro / Aniwatch HD',
    version: 'v4.0.2',
    author: 'Zoro Streamers',
    description: 'Full high-definition provider with community subtitles, timestamps, and multi-server redundancy (VidStreaming, StreamSB, MegaCloud).',
    badge: 'TOP RATED',
    badgeType: 'featured',
    streamType: 'hls',
    baseUrl: 'https://stream.aniwatch.to/embed',
    enabled: false,
    isDefault: false,
    latencyMs: 38,
    status: 'online',
    supportedResolutions: ['1080p', '720p'],
    supportsDub: true,
    supportsSub: true,
    hasIntroSkip: true,
    downloadsEnabled: true,
    lastUpdated: '4 days ago'
  },
  {
    id: 'bilibili-global',
    name: 'Bilibili Global Official',
    version: 'v2.1.0',
    author: 'BiliBili Community',
    description: 'Official Southeast Asia licensed streams with multi-language subtitle tracks (Indonesian, Thai, Vietnamese, English) and 60fps smoothing.',
    badge: 'MULTI-LANG',
    badgeType: 'community',
    streamType: 'api',
    baseUrl: 'https://api.bilibili.tv/intl/gateway/v2/ogv/playurl',
    enabled: false,
    isDefault: false,
    latencyMs: 65,
    status: 'online',
    supportedResolutions: ['1080p', '720p', '480p'],
    supportsDub: false,
    supportsSub: true,
    hasIntroSkip: true,
    downloadsEnabled: false,
    lastUpdated: '1 week ago'
  },
  {
    id: 'kickass-anime-v2',
    name: 'KickAssAnime Pro',
    version: 'v2.0.1',
    author: 'KAA Devs',
    description: 'Clean player wrapper with integrated hardsubbed episode mirrors and ultra-fast direct MP4 video fallback.',
    badge: 'FASTEST',
    badgeType: 'fast',
    streamType: 'mp4',
    baseUrl: 'https://kaas.to/api/show',
    enabled: false,
    isDefault: false,
    latencyMs: 31,
    status: 'online',
    supportedResolutions: ['1080p', '720p'],
    supportsDub: true,
    supportsSub: true,
    hasIntroSkip: false,
    downloadsEnabled: true,
    lastUpdated: '2 weeks ago'
  },
  {
    id: 'animedex-fast',
    name: 'AnimeDex Ultra CDN',
    version: 'v1.5.0',
    author: 'Dex Community',
    description: 'Minimalist, zero-ad anime provider optimized for instantaneous stream startup and low latency seek.',
    badge: 'ZERO BUFFER',
    badgeType: 'community',
    streamType: 'hls',
    baseUrl: 'https://animedex.live/api/source',
    enabled: false,
    isDefault: false,
    latencyMs: 24,
    status: 'online',
    supportedResolutions: ['1080p', '720p'],
    supportsDub: true,
    supportsSub: true,
    hasIntroSkip: true,
    downloadsEnabled: true,
    lastUpdated: '3 weeks ago'
  },
  {
    id: 'nyaa-debrid-streamer',
    name: 'TorBox / RealDebrid Streamer',
    version: 'v3.0.0',
    author: 'Seedbox Group',
    description: 'Direct high-bitrate BDMV/Remux torrent cache streaming with lossless FLAC audio and PGS anime subtitles.',
    badge: 'REMUX LOSSLESS',
    badgeType: 'official',
    streamType: 'api',
    baseUrl: 'https://api.real-debrid.com/rest/1.0/streaming',
    enabled: false,
    isDefault: false,
    latencyMs: 82,
    status: 'online',
    supportedResolutions: ['4K', '1080p'],
    supportsDub: true,
    supportsSub: true,
    hasIntroSkip: false,
    downloadsEnabled: true,
    lastUpdated: '1 month ago'
  }
];

export const SAMPLE_REPOSITORIES = [
  {
    title: 'Kamui Verified Sources Hub',
    url: 'https://raw.githubusercontent.com/kamui-org/extensions/main/verified-sources.json',
    description: 'Curated 4K HDR & Dual-Audio streaming servers checked hourly for 99.9% uptime.'
  },
  {
    title: 'Anime Community Multi-Mirror Repository',
    url: 'https://raw.githubusercontent.com/anime-stream/extensions-repo/v2/index.json',
    description: 'Over 15+ community mirrors including HiAnime, GogoAnime, and AnimePahe scrapers.'
  },
  {
    title: 'Consumet Global Scrapers Feed',
    url: 'https://api.consumet.org/extensions/anime-sources.json',
    description: 'REST API streaming endpoints covering all ongoing Japanese simulcasts with subs.'
  }
];
