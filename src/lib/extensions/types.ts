/**
 * Declarative HTTP Extension Types for Kamui
 * Protocol Schema: 1
 */

export type StreamType = 'http' | 'hls' | 'p2p';

export interface SubtitleTrack {
  lang: string;
  label: string;
  url: string;
}

export interface StreamItem {
  title: string;
  type: StreamType;
  url: string;
  quality?: string;
  subtitles?: SubtitleTrack[];
  language?: string;
  // Internal UI annotations:
  extensionId?: string;
  extensionName?: string;
  isUnsupported?: boolean; // Set for 'p2p'
}

export interface StreamResponse {
  streams: StreamItem[];
}

export interface ExtensionManifest {
  schema: 1;
  id: string; // reverse-DNS unique, e.g. "com.example.myext"
  name: string;
  version: string;
  description: string;
  icon?: string;
  homepage?: string;
  resources: ('stream')[];
}

export interface InstalledExtension {
  id: string;
  baseUrl: string;
  manifest: ExtensionManifest;
  enabled: boolean;
  order: number;
  installedAt: number;
  lastCheckedAt?: number;
  healthStatus?: 'ok' | 'error' | 'checking';
  healthLatencyMs?: number;
}

export type ExtensionQueryStatus = 'loading' | 'ok' | 'empty' | 'error';

export interface ExtensionStreamResult {
  extension: InstalledExtension;
  status: ExtensionQueryStatus;
  streams: StreamItem[];
  error?: string;
}

export interface QueryStreamParams {
  title?: string;
  titleEnglish?: string;
  year?: number;
  format?: string;
}
