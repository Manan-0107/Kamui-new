'use client';

import { useState, useEffect } from 'react';
import { AnimeRatings, NextAiringInfo } from '@/lib/types';
import { fetchAnimeById } from '@/lib/anilist';

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
  const defaultInfo: LiveTrackerInfo = {
    animeId,
    displayTitle: 'Anime',
    status: 'RELEASING',
    apisUsed: ['AniList GraphQL API'],
    isLoading: !trackerCache[animeId]
  };

  const [trackerInfo, setTrackerInfo] = useState<LiveTrackerInfo>(() => {
    return trackerCache[animeId] || defaultInfo;
  });

  useEffect(() => {
    if (!animeId) return;

    if (trackerCache[animeId]) {
      setTrackerInfo(trackerCache[animeId]);
      return;
    }

    let isMounted = true;
    fetchAnimeById(animeId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          const liveData: LiveTrackerInfo = {
            animeId,
            displayTitle: data.title,
            ratings: data.ratings,
            posterImage: data.posterImage,
            bannerImage: data.bannerImage,
            nextAiring: data.nextAiring,
            status: data.maturityDesc?.replace('Status: ', '') || 'RELEASING',
            totalEpisodes: data.episodes?.length || 24,
            apisUsed: ['AniList GraphQL API'],
            isLoading: false
          };
          trackerCache[animeId] = liveData;
          setTrackerInfo(liveData);
        } else {
          setTrackerInfo((prev) => ({ ...prev, isLoading: false }));
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
