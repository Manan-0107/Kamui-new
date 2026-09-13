'use client';

import { useState, useEffect } from 'react';
import { AnimeRatings, NextAiringInfo } from '@/lib/types';
import { ANIME_CATALOG, ANIME_IMAGE_MAP } from '@/lib/catalog';

export interface LiveTrackerInfo {
  animeId: string;
  displayTitle: string;
  ratings?: AnimeRatings;
  posterImage?: string;
  bannerImage?: string;
  nextAiring?: NextAiringInfo;
  status?: string;
  totalEpisodes?: number;
  apisUsed?: string[];
  isLoading: boolean;
}

const trackerCache: Record<string, LiveTrackerInfo> = {};

export function useAnimeTracker(animeId: string): LiveTrackerInfo {
  const catalogEntry = ANIME_CATALOG[animeId];
  const catalogImg = ANIME_IMAGE_MAP[animeId];

  const defaultInfo: LiveTrackerInfo = {
    animeId,
    displayTitle: catalogEntry?.title || animeId,
    ratings: catalogEntry?.ratings,
    posterImage: catalogImg?.poster || catalogEntry?.posterImage,
    bannerImage: catalogImg?.banner || catalogEntry?.bannerImage,
    nextAiring: catalogImg?.nextAiring || catalogEntry?.nextAiring,
    status: 'RELEASING',
    totalEpisodes: catalogEntry?.episodes?.length || 24,
    apisUsed: ['AniList GraphQL API', 'MyAnimeList API', 'Kitsu API'],
    isLoading: !trackerCache[animeId]
  };

  const [trackerInfo, setTrackerInfo] = useState<LiveTrackerInfo>(() => {
    return trackerCache[animeId] || defaultInfo;
  });

  useEffect(() => {
    let isMounted = true;

    if (trackerCache[animeId]) {
      setTrackerInfo(trackerCache[animeId]);
      return;
    }

    fetch(`/api/anime-tracker?id=${encodeURIComponent(animeId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success) {
          const liveData: LiveTrackerInfo = {
            animeId,
            displayTitle: data.displayTitle || catalogEntry?.title || animeId,
            ratings: data.ratings || catalogEntry?.ratings,
            posterImage: data.posterImage || catalogImg?.poster,
            bannerImage: data.bannerImage || catalogImg?.banner,
            nextAiring: data.nextAiring || catalogImg?.nextAiring,
            status: data.status || 'RELEASING',
            totalEpisodes: data.totalEpisodes || catalogEntry?.episodes?.length || 24,
            apisUsed: data.apisUsed,
            isLoading: false
          };
          trackerCache[animeId] = liveData;
          setTrackerInfo(liveData);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTrackerInfo((prev) => ({ ...prev, isLoading: false }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [animeId]);

  return trackerInfo;
}
