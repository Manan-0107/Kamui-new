'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ContinueWatchingItem } from '@/lib/types';
import { ANIME_CATALOG } from '@/lib/catalog';
import { useToast } from './ToastContext';

const WATCHLIST_STORAGE_KEY = 'kamui_watchlist';
const CONTINUE_STORAGE_KEY = 'kamui_continue_watching';
const LIKED_STORAGE_KEY = 'kamui_liked_titles';

interface PlaybackContextType {
  // Preview Modal
  previewAnimeId: string | null;
  isPreviewOpen: boolean;
  openPreview: (animeId: string) => void;
  closePreview: () => void;

  // Full Video Player
  playingAnimeId: string | null;
  playingEpNum: number;
  isPlayerOpen: boolean;
  playEpisode: (animeId: string, epNum?: number) => void;
  closePlayer: () => void;

  // Watchlist
  watchlist: string[];
  addToWatchlist: (animeId: string) => void;
  removeFromWatchlist: (animeId: string) => void;
  toggleWatchlist: (animeId: string) => void;
  isInWatchlist: (animeId: string) => boolean;

  // Continue Watching
  continueWatching: ContinueWatchingItem[];
  saveProgress: (animeId: string, epNum: number, currentTime: number, duration: number) => void;
  clearContinueWatching: () => void;
  removeContinueItem: (animeId: string) => void;

  // Likes
  likedTitles: string[];
  toggleLike: (animeId: string) => void;
  isLiked: (animeId: string) => boolean;

  // Sidebar
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Filter & Search
  filterGenre: string;
  setFilterGenre: (genre: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [previewAnimeId, setPreviewAnimeId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [playingAnimeId, setPlayingAnimeId] = useState<string | null>(null);
  const [playingEpNum, setPlayingEpNum] = useState<number>(1);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [likedTitles, setLikedTitles] = useState<string[]>([]);

  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const { showToast } = useToast();

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  useEffect(() => {
    try {
      const rawWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (rawWatchlist) setWatchlist(JSON.parse(rawWatchlist));

      const rawContinue = localStorage.getItem(CONTINUE_STORAGE_KEY);
      if (rawContinue) setContinueWatching(JSON.parse(rawContinue));

      const rawLikes = localStorage.getItem(LIKED_STORAGE_KEY);
      if (rawLikes) setLikedTitles(JSON.parse(rawLikes));
    } catch (e) {}
  }, []);

  // Open / Close Preview Modal
  const openPreview = useCallback((animeId: string) => {
    if (!ANIME_CATALOG[animeId]) return;
    setPreviewAnimeId(animeId);
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  // Full Screen Video Player
  const playEpisode = useCallback(
    (animeId: string, epNum = 1) => {
      if (!ANIME_CATALOG[animeId]) return;
      setPlayingAnimeId(animeId);
      setPlayingEpNum(epNum);
      setIsPlayerOpen(true);
      setIsPreviewOpen(false); // Close preview when player opens
    },
    []
  );

  const closePlayer = useCallback(() => {
    setIsPlayerOpen(false);
  }, []);

  // Watchlist methods
  const addToWatchlist = useCallback(
    (animeId: string) => {
      const anime = ANIME_CATALOG[animeId];
      if (!anime) return;
      setWatchlist((prev) => {
        if (prev.includes(animeId)) return prev;
        const next = [...prev, animeId];
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      showToast(`Added "${anime.title}" to My List`, 'success');
    },
    [showToast]
  );

  const removeFromWatchlist = useCallback(
    (animeId: string) => {
      const anime = ANIME_CATALOG[animeId];
      setWatchlist((prev) => {
        const next = prev.filter((id) => id !== animeId);
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      if (anime) {
        showToast(`Removed "${anime.title}" from My List`, 'info');
      }
    },
    [showToast]
  );

  const toggleWatchlist = useCallback(
    (animeId: string) => {
      if (watchlist.includes(animeId)) {
        removeFromWatchlist(animeId);
      } else {
        addToWatchlist(animeId);
      }
    },
    [watchlist, addToWatchlist, removeFromWatchlist]
  );

  const isInWatchlist = useCallback(
    (animeId: string): boolean => {
      return watchlist.includes(animeId);
    },
    [watchlist]
  );

  // Continue Watching methods
  const saveProgress = useCallback(
    (animeId: string, epNum: number, currentTime: number, duration: number) => {
      const anime = ANIME_CATALOG[animeId];
      if (!anime || duration <= 0) return;

      const ep = anime.episodes.find((e) => e.num === epNum) || anime.episodes[0];
      const percentage = Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)));

      setContinueWatching((prev) => {
        const filtered = prev.filter((item) => item.animeId !== animeId);
        const updatedItem: ContinueWatchingItem = {
          animeId,
          episodeNum: epNum,
          currentTime: Math.round(currentTime),
          duration: Math.round(duration),
          percentage,
          title: anime.title,
          episodeTitle: ep ? `Episode ${ep.num}: ${ep.title}` : `Episode ${epNum}`,
          updatedAt: Date.now()
        };
        const next = [updatedItem, ...filtered].slice(0, 12);
        try {
          localStorage.setItem(CONTINUE_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    },
    []
  );

  const clearContinueWatching = useCallback(() => {
    setContinueWatching([]);
    try {
      localStorage.removeItem(CONTINUE_STORAGE_KEY);
    } catch (e) {}
    showToast('Watch history cleared', 'info');
  }, [showToast]);

  const removeContinueItem = useCallback((animeId: string) => {
    setContinueWatching((prev) => {
      const next = prev.filter((i) => i.animeId !== animeId);
      try {
        localStorage.setItem(CONTINUE_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Likes
  const toggleLike = useCallback(
    (animeId: string) => {
      const anime = ANIME_CATALOG[animeId];
      setLikedTitles((prev) => {
        const exists = prev.includes(animeId);
        const next = exists ? prev.filter((id) => id !== animeId) : [...prev, animeId];
        try {
          localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {}
        if (!exists && anime) {
          showToast(`Marked "${anime.title}" as favorite!`, 'success');
        }
        return next;
      });
    },
    [showToast]
  );

  const isLiked = useCallback(
    (animeId: string): boolean => {
      return likedTitles.includes(animeId);
    },
    [likedTitles]
  );

  return (
    <PlaybackContext.Provider
      value={{
        previewAnimeId,
        isPreviewOpen,
        openPreview,
        closePreview,
        playingAnimeId,
        playingEpNum,
        isPlayerOpen,
        playEpisode,
        closePlayer,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        continueWatching,
        saveProgress,
        clearContinueWatching,
        removeContinueItem,
        likedTitles,
        toggleLike,
        isLiked,
        filterGenre,
        setFilterGenre,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = (): PlaybackContextType => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
};
