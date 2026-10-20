'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ContinueWatchingItem, TrackerStatus, AnimeNotification } from '@/lib/types';
import { useToast } from './ToastContext';

const WATCHLIST_STORAGE_KEY = 'kamui_watchlist';
const CONTINUE_STORAGE_KEY = 'kamui_continue_watching';
const LIKED_STORAGE_KEY = 'kamui_liked_titles';
const TRACKER_STORAGE_KEY = 'kamui_anime_tracker';
const NOTIF_SUBS_KEY = 'kamui_subscribed_notifs';
const NOTIFS_LIST_KEY = 'kamui_anime_notifications';

interface PlaybackContextType {
  // Preview Modal
  previewAnimeId: string | null;
  customPreviewData: any | null;
  isPreviewOpen: boolean;
  openPreview: (animeId: string, customData?: any) => void;
  closePreview: () => void;

  // Full Video Player
  playingAnimeId: string | null;
  playingEpNum: number;
  activeStream: any | null;
  isPlayerOpen: boolean;
  playEpisode: (animeId: string, epNum?: number, stream?: any) => void;
  closePlayer: () => void;

  // Watchlist
  watchlist: string[];
  addToWatchlist: (animeId: string, title?: string) => void;
  removeFromWatchlist: (animeId: string, title?: string) => void;
  toggleWatchlist: (animeId: string, title?: string) => void;
  isInWatchlist: (animeId: string) => boolean;

  // Continue Watching
  continueWatching: ContinueWatchingItem[];
  saveProgress: (animeId: string, epNum: number, currentTime: number, duration: number, title?: string) => void;
  clearContinueWatching: () => void;
  removeContinueItem: (animeId: string) => void;

  // Likes
  likedTitles: string[];
  toggleLike: (animeId: string, title?: string) => void;
  isLiked: (animeId: string) => boolean;
  clearLikedTitles: () => void;

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

  // Anime Tracker System
  trackerStatus: Record<string, TrackerStatus>;
  setAnimeTrackerStatus: (animeId: string, status: TrackerStatus | null, title?: string) => void;
  getAnimeTrackerStatus: (animeId: string) => TrackerStatus | undefined;

  // Simulcast Notifications
  subscribedAnimeIds: string[];
  toggleNotificationSubscription: (animeId: string, title?: string) => void;
  isNotificationSubscribed: (animeId: string) => boolean;
  notifications: AnimeNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Global Hover Portal
  hoveredAnimeId: string | null;
  hoverRect: { top: number; left: number; width: number; height: number } | null;
  setHoveredCard: (animeId: string | null, rect?: { top: number; left: number; width: number; height: number } | null) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [previewAnimeId, setPreviewAnimeId] = useState<string | null>(null);
  const [customPreviewData, setCustomPreviewData] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [playingAnimeId, setPlayingAnimeId] = useState<string | null>(null);
  const [playingEpNum, setPlayingEpNum] = useState<number>(1);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [likedTitles, setLikedTitles] = useState<string[]>([]);

  // Anime Tracker System State
  const [trackerStatus, setTrackerStatus] = useState<Record<string, TrackerStatus>>({});

  // Simulcast Notifications State
  const [subscribedAnimeIds, setSubscribedAnimeIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AnimeNotification[]>([]);

  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Global Hover Portal State
  const [hoveredAnimeId, setHoveredAnimeIdState] = useState<string | null>(null);
  const [hoverRect, setHoverRectState] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setHoveredCard = useCallback((animeId: string | null, rect?: { top: number; left: number; width: number; height: number } | null) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (animeId && rect) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredAnimeIdState(animeId);
        setHoverRectState(rect);
      }, 350);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredAnimeIdState(null);
        setHoverRectState(null);
      }, 250);
    }
  }, []);

  const { showToast } = useToast();

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  // Hydrate & run migration to drop old non-numeric string IDs
  useEffect(() => {
    const isNumericId = (id: any): boolean => typeof id === 'string' && /^\d+$/.test(id);

    try {
      const rawWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (rawWatchlist) {
        const parsed = JSON.parse(rawWatchlist);
        const valid = Array.isArray(parsed) ? parsed.filter(isNumericId) : [];
        setWatchlist(valid);
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(valid));
      }

      const rawContinue = localStorage.getItem(CONTINUE_STORAGE_KEY);
      if (rawContinue) {
        const parsed = JSON.parse(rawContinue);
        const valid = Array.isArray(parsed) ? parsed.filter((item: any) => item && isNumericId(item.animeId)) : [];
        setContinueWatching(valid);
        localStorage.setItem(CONTINUE_STORAGE_KEY, JSON.stringify(valid));
      }

      const rawLikes = localStorage.getItem(LIKED_STORAGE_KEY);
      if (rawLikes) {
        const parsed = JSON.parse(rawLikes);
        const valid = Array.isArray(parsed) ? parsed.filter(isNumericId) : [];
        setLikedTitles(valid);
        localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(valid));
      }

      const rawTracker = localStorage.getItem(TRACKER_STORAGE_KEY);
      if (rawTracker) {
        const parsed = JSON.parse(rawTracker);
        const valid: Record<string, TrackerStatus> = {};
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            if (isNumericId(k) && typeof v === 'string') {
              valid[k] = v as TrackerStatus;
            }
          }
        }
        setTrackerStatus(valid);
        localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(valid));
      }

      const rawSubbed = localStorage.getItem(NOTIF_SUBS_KEY);
      if (rawSubbed) {
        const parsed = JSON.parse(rawSubbed);
        const valid = Array.isArray(parsed) ? parsed.filter(isNumericId) : [];
        setSubscribedAnimeIds(valid);
        localStorage.setItem(NOTIF_SUBS_KEY, JSON.stringify(valid));
      }

      const rawNotifs = localStorage.getItem(NOTIFS_LIST_KEY);
      if (rawNotifs) {
        const parsed = JSON.parse(rawNotifs);
        const valid = Array.isArray(parsed) ? parsed.filter((n: any) => n && isNumericId(n.animeId)) : [];
        setNotifications(valid);
        localStorage.setItem(NOTIFS_LIST_KEY, JSON.stringify(valid));
      }
    } catch {
      // LocalStorage access failure fallback
    }
  }, []);

  // Open / Close Preview Modal
  const openPreview = useCallback((animeId: string, customData?: any) => {
    if (customData) {
      setCustomPreviewData(customData);
      setPreviewAnimeId(animeId);
      setIsPreviewOpen(true);
      return;
    }
    setCustomPreviewData(null);
    setPreviewAnimeId(animeId);
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setCustomPreviewData(null);
  }, []);

  const [activeStream, setActiveStream] = useState<any | null>(null);

  // Full Screen Video Player
  const playEpisode = useCallback(
    (animeId: string, epNum = 1, stream?: any) => {
      setPlayingAnimeId(animeId);
      setPlayingEpNum(epNum);
      setActiveStream(stream || null);
      setIsPlayerOpen(true);
    },
    []
  );

  const closePlayer = useCallback(() => {
    setIsPlayerOpen(false);
    setActiveStream(null);
  }, []);

  // Helper to resolve title
  const getDisplayTitle = useCallback(
    (animeId: string, title?: string) => {
      if (title) return title;
      if (customPreviewData && customPreviewData.id === animeId && customPreviewData.title) {
        return customPreviewData.title;
      }
      return 'Anime';
    },
    [customPreviewData]
  );

  // Watchlist methods
  const addToWatchlist = useCallback(
    (animeId: string, title?: string) => {
      const displayTitle = getDisplayTitle(animeId, title);
      setWatchlist((prev) => {
        if (prev.includes(animeId)) return prev;
        const next = [...prev, animeId];
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast(`Added "${displayTitle}" to My List`, 'success');
    },
    [getDisplayTitle, showToast]
  );

  const removeFromWatchlist = useCallback(
    (animeId: string, title?: string) => {
      const displayTitle = getDisplayTitle(animeId, title);
      setWatchlist((prev) => {
        const next = prev.filter((id) => id !== animeId);
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast(`Removed "${displayTitle}" from My List`, 'info');
    },
    [getDisplayTitle, showToast]
  );

  const toggleWatchlist = useCallback(
    (animeId: string, title?: string) => {
      if (watchlist.includes(animeId)) {
        removeFromWatchlist(animeId, title);
      } else {
        addToWatchlist(animeId, title);
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
    (animeId: string, epNum: number, currentTime: number, duration: number, title?: string) => {
      if (duration <= 0) return;

      const percentage = Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)));
      const animeTitle = getDisplayTitle(animeId, title);

      setContinueWatching((prev) => {
        const filtered = prev.filter((item) => item.animeId !== animeId);
        const updatedItem: ContinueWatchingItem = {
          animeId,
          episodeNum: epNum,
          currentTime: Math.round(currentTime),
          duration: Math.round(duration),
          percentage,
          title: animeTitle,
          episodeTitle: `Episode ${epNum}`,
          updatedAt: Date.now()
        };
        const next = [updatedItem, ...filtered].slice(0, 12);
        try {
          localStorage.setItem(CONTINUE_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [getDisplayTitle]
  );

  const clearContinueWatching = useCallback(() => {
    setContinueWatching([]);
    try {
      localStorage.removeItem(CONTINUE_STORAGE_KEY);
    } catch {}
    showToast('Watch history cleared', 'info');
  }, [showToast]);

  const removeContinueItem = useCallback((animeId: string) => {
    setContinueWatching((prev) => {
      const next = prev.filter((i) => i.animeId !== animeId);
      try {
        localStorage.setItem(CONTINUE_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Likes
  const toggleLike = useCallback(
    (animeId: string, title?: string) => {
      const displayTitle = getDisplayTitle(animeId, title);
      setLikedTitles((prev) => {
        const exists = prev.includes(animeId);
        const next = exists ? prev.filter((id) => id !== animeId) : [...prev, animeId];
        try {
          localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        if (!exists) {
          showToast(`Marked "${displayTitle}" as favorite!`, 'success');
        }
        return next;
      });
    },
    [getDisplayTitle, showToast]
  );

  const isLiked = useCallback(
    (animeId: string): boolean => {
      return likedTitles.includes(animeId);
    },
    [likedTitles]
  );

  const clearLikedTitles = useCallback(() => {
    setLikedTitles([]);
    try {
      localStorage.removeItem(LIKED_STORAGE_KEY);
    } catch {}
    showToast('Liked anime list cleared', 'info');
  }, [showToast]);

  // Anime Tracker Handlers
  const setAnimeTrackerStatus = useCallback(
    (animeId: string, status: TrackerStatus | null, title?: string) => {
      const displayTitle = getDisplayTitle(animeId, title);
      setTrackerStatus((prev) => {
        const next = { ...prev };
        if (!status) {
          delete next[animeId];
          try {
            localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(next));
          } catch {}
          showToast(`Removed "${displayTitle}" from your Tracker`, 'info');
        } else {
          next[animeId] = status;
          try {
            localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(next));
          } catch {}
          const labels: Record<TrackerStatus, string> = {
            watching: 'Watching',
            planning: 'Plan to Watch',
            completed: 'Completed',
            on_hold: 'On Hold',
            dropped: 'Dropped'
          };
          showToast(`Marked "${displayTitle}" as ${labels[status]}`, 'success');
        }
        return next;
      });
    },
    [getDisplayTitle, showToast]
  );

  const getAnimeTrackerStatus = useCallback(
    (animeId: string): TrackerStatus | undefined => {
      return trackerStatus[animeId];
    },
    [trackerStatus]
  );

  // Simulcast Notifications Handlers
  const toggleNotificationSubscription = useCallback(
    (animeId: string, title?: string) => {
      const displayTitle = getDisplayTitle(animeId, title);
      setSubscribedAnimeIds((prev) => {
        const isSubbed = prev.includes(animeId);
        const next = isSubbed ? prev.filter((id) => id !== animeId) : [...prev, animeId];
        try {
          localStorage.setItem(NOTIF_SUBS_KEY, JSON.stringify(next));
        } catch {}

        if (!isSubbed) {
          showToast(`Simulcast alerts enabled for "${displayTitle}"`, 'success');
          const newNotif: AnimeNotification = {
            id: `sub-${animeId}-${Date.now()}`,
            animeId,
            animeTitle: displayTitle,
            episodeNum: 1,
            message: `Simulcast alerts active for ${displayTitle}.`,
            timeAgo: 'Just now',
            read: false,
            timestamp: Date.now()
          };
          setNotifications((n) => {
            const updated = [newNotif, ...n.filter((item) => item.id !== newNotif.id)].slice(0, 20);
            try {
              localStorage.setItem(NOTIFS_LIST_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        } else {
          showToast(`Alerts disabled for "${displayTitle}"`, 'info');
        }
        return next;
      });
    },
    [getDisplayTitle, showToast]
  );

  const isNotificationSubscribed = useCallback(
    (animeId: string): boolean => {
      return subscribedAnimeIds.includes(animeId);
    },
    [subscribedAnimeIds]
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(NOTIFS_LIST_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(NOTIFS_LIST_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(NOTIFS_LIST_KEY);
    } catch {}
    showToast('Notifications cleared', 'info');
  }, [showToast]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <PlaybackContext.Provider
      value={{
        previewAnimeId,
        customPreviewData,
        isPreviewOpen,
        openPreview,
        closePreview,
        playingAnimeId,
        playingEpNum,
        activeStream,
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
        clearLikedTitles,
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
        toggleSidebar,
        hoveredAnimeId,
        hoverRect,
        setHoveredCard,
        trackerStatus,
        setAnimeTrackerStatus,
        getAnimeTrackerStatus,
        subscribedAnimeIds,
        toggleNotificationSubscription,
        isNotificationSubscribed,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications
      } as any}
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
