'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimeData } from '@/lib/types';
import {
  fetchAnimeById,
  fetchAnimeByIds,
  fetchTrending,
  fetchPopularThisSeason,
  fetchTopRated,
  fetchByGenre,
  searchAnime,
  fetchLiveAiringSchedule,
  LiveScheduleItem
} from '@/lib/anilist';

export type CatalogRowKind =
  | 'trending'
  | 'popular'
  | 'topRated'
  | { genre: string }
  | { ids: string[] };

/**
 * Hook to fetch a single anime by ID with loading skeletons & retry
 */
export function useAnime(id: string | null | undefined) {
  const [anime, setAnime] = useState<AnimeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  const loadAnime = useCallback(async () => {
    if (!id) {
      setAnime(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAnimeById(id);
      setAnime(data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnime();
  }, [loadAnime]);

  return { anime, isLoading, error, retry: loadAnime };
}

/**
 * Hook to fetch an entire row of catalog anime
 */
export function useCatalogRow(kind: CatalogRowKind, limit = 18) {
  const [animes, setAnimes] = useState<AnimeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const kindKey = typeof kind === 'string' ? kind : 'genre' in kind ? `genre:${kind.genre}` : `ids:${kind.ids.join(',')}`;

  const loadRow = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: AnimeData[] = [];
      if (kind === 'trending') {
        data = await fetchTrending(1, limit);
      } else if (kind === 'popular') {
        data = await fetchPopularThisSeason(1, limit);
      } else if (kind === 'topRated') {
        data = await fetchTopRated(1, limit);
      } else if (typeof kind === 'object' && 'genre' in kind) {
        data = await fetchByGenre(kind.genre, 1, limit);
      } else if (typeof kind === 'object' && 'ids' in kind) {
        data = await fetchAnimeByIds(kind.ids);
      }
      setAnimes(data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [kindKey, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadRow();
  }, [loadRow]);

  return { animes, isLoading, error, retry: loadRow };
}

/**
 * Hook for live search queries with 300ms debounce
 */
export function useAnimeSearch(query: string) {
  const [results, setResults] = useState<AnimeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchAnime(trimmed, 1, 24);
        setResults(data);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  return { results, isLoading, error };
}

/**
 * Hook to fetch live airing simulcast schedule directly from AniList
 */
export function useLiveSchedule(limit = 12) {
  const [schedule, setSchedule] = useState<LiveScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLiveAiringSchedule(1, limit);
      setSchedule(data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  return { schedule, isLoading, error, retry: loadSchedule };
}
