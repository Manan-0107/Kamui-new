'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StreamItem,
  ExtensionStreamResult,
  QueryStreamParams,
  fetchStreams
} from '@/lib/extensions';
import { useExtensions } from './useExtensions';

// In-memory stream cache (10 minute TTL)
interface CacheEntry {
  streams: StreamItem[];
  perExtension: ExtensionStreamResult[];
  expiresAt: number;
}

const memoryStreamCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 50; // Cap to prevent unbounded memory growth

/**
 * Clear in-memory stream cache
 */
export function clearStreamCache(): void {
  memoryStreamCache.clear();
}

/**
 * Get current in-memory stream cache size (useful for tests)
 */
export function getStreamCacheSize(): number {
  return memoryStreamCache.size;
}

/**
 * Hook to query all enabled extensions in parallel for an anime episode.
 * Returns merged streams, per-extension status, and retry capability.
 */
export function useStreams(
  animeId: number | string | null | undefined,
  episodeNumber: number | null | undefined,
  params?: QueryStreamParams
) {
  const { enabledExtensions, isLoading: isExtensionsLoading } = useExtensions();

  const [streams, setStreams] = useState<StreamItem[]>([]);
  const [perExtension, setPerExtension] = useState<ExtensionStreamResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdRef = useRef(0);

  const title = params?.title;
  const titleEnglish = params?.titleEnglish;
  const year = params?.year;
  const format = params?.format;

  const queryStreams = useCallback(async () => {
    if (!animeId || !episodeNumber || episodeNumber <= 0) {
      setStreams((prev) => (prev.length > 0 ? [] : prev));
      setPerExtension((prev) => (prev.length > 0 ? [] : prev));
      setIsLoading((prev) => (prev ? false : prev));
      setError((prev) => (prev !== null ? null : prev));
      return;
    }

    if (enabledExtensions.length === 0) {
      const noExtMsg = 'No extensions enabled. Install or enable an extension to fetch streams.';
      setStreams((prev) => (prev.length > 0 ? [] : prev));
      setPerExtension((prev) => (prev.length > 0 ? [] : prev));
      setIsLoading((prev) => (prev ? false : prev));
      setError((prev) => (prev !== noExtMsg ? noExtMsg : prev));
      return;
    }

    const cacheKey = `${animeId}:${episodeNumber}:${enabledExtensions.map((e) => e.id).sort().join(',')}:${format || ''}:${year || ''}`;
    const now = Date.now();
    const cached = memoryStreamCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      setStreams(cached.streams);
      setPerExtension(cached.perExtension);
      setIsLoading(false);
      setError(null);
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);

    // Initialize per-extension states to 'loading'
    const initialStatuses: ExtensionStreamResult[] = enabledExtensions.map((ext) => ({
      extension: ext,
      status: 'loading',
      streams: []
    }));
    setPerExtension(initialStatuses);

    const queryParams: QueryStreamParams = {
      ...(title !== undefined && { title }),
      ...(titleEnglish !== undefined && { titleEnglish }),
      ...(year !== undefined && { year }),
      ...(format !== undefined && { format })
    };

    // Query all enabled extensions in parallel
    const promises = enabledExtensions.map(async (ext): Promise<ExtensionStreamResult> => {
      try {
        const res = await fetchStreams(ext.baseUrl, animeId, episodeNumber, queryParams);
        const annotatedStreams: StreamItem[] = res.streams.map((s) => ({
          ...s,
          extensionId: ext.id,
          extensionName: ext.manifest.name
        }));

        return {
          extension: ext,
          status: annotatedStreams.length > 0 ? 'ok' : 'empty',
          streams: annotatedStreams
        };
      } catch (err: any) {
        return {
          extension: ext,
          status: 'error',
          streams: [],
          error: err.message || 'Failed to fetch streams'
        };
      }
    });

    const results = await Promise.all(promises);

    // If fetch was superseded by a newer call, ignore
    if (fetchIdRef.current !== currentFetchId) return;

    // Merge streams across all extensions
    const mergedStreams: StreamItem[] = [];
    for (const r of results) {
      mergedStreams.push(...r.streams);
    }

    // Clean expired entries first
    for (const [key, entry] of memoryStreamCache.entries()) {
      if (entry.expiresAt <= now) {
        memoryStreamCache.delete(key);
      }
    }
    // Enforce max capacity by evicting oldest entry
    while (memoryStreamCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = memoryStreamCache.keys().next().value;
      if (oldestKey) memoryStreamCache.delete(oldestKey);
      else break;
    }

    // Save in memory cache
    memoryStreamCache.set(cacheKey, {
      streams: mergedStreams,
      perExtension: results,
      expiresAt: now + CACHE_TTL_MS
    });

    setPerExtension(results);
    setStreams(mergedStreams);
    setIsLoading(false);

    if (mergedStreams.length === 0 && results.some((r) => r.status === 'error')) {
      const errorCount = results.filter((r) => r.status === 'error').length;
      setError(`${errorCount} extension(s) returned an error while finding streams.`);
    }
  }, [animeId, episodeNumber, enabledExtensions, title, titleEnglish, year, format]);

  useEffect(() => {
    if (!isExtensionsLoading) {
      queryStreams();
    }
  }, [queryStreams, isExtensionsLoading]);

  return {
    streams,
    perExtension,
    isLoading: isLoading || isExtensionsLoading,
    error,
    retry: queryStreams
  };
}
