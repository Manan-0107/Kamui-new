'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StreamItem,
  ExtensionStreamResult,
  QueryStreamParams,
  InstalledExtension,
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

/**
 * Clear in-memory stream cache
 */
export function clearStreamCache(): void {
  memoryStreamCache.clear();
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

  const queryStreams = useCallback(async () => {
    if (!animeId || !episodeNumber || episodeNumber <= 0) {
      setStreams([]);
      setPerExtension([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (enabledExtensions.length === 0) {
      setStreams([]);
      setPerExtension([]);
      setIsLoading(false);
      setError('No extensions enabled. Install or enable an extension to fetch streams.');
      return;
    }

    const cacheKey = `${animeId}:${episodeNumber}:${enabledExtensions.map((e) => e.id).join(',')}`;
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

    // Query all enabled extensions in parallel
    const promises = enabledExtensions.map(async (ext): Promise<ExtensionStreamResult> => {
      try {
        const res = await fetchStreams(ext.baseUrl, animeId, episodeNumber, params);
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
  }, [animeId, episodeNumber, enabledExtensions, params]);

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
