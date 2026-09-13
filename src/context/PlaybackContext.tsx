'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ContinueWatchingItem, TrackerStatus, AnimeNotification } from '@/lib/types';
import { ANIME_CATALOG } from '@/lib/catalog';
import { useToast } from './ToastContext';

const WATCHLIST_STORAGE_KEY = 'kamui_watchlist';
const CONTINUE_STORAGE_KEY = 'kamui_continue_watching';
const LIKED_STORAGE_KEY = 'kamui_liked_titles';
const TRACKER_STORAGE_KEY = 'kamui_anime_tracker';
const NOTIF_SUBS_KEY = 'kamui_subscribed_notifs';
const NOTIFS_LIST_KEY = 'kamui_anime_notifications';

const DEFAULT_NOTIFICATIONS: AnimeNotification[] = [
  {
    id: 'notif-1',
    animeId: 'kamui',
    animeTitle: 'Blade of Kamui',
    episodeNum: 9,
    message: 'Episode 9 airs tonight at 23:00 JST. Simulcast ready.',
    timeAgo: '2h ago',
    read: false,
    timestamp: Date.now() - 7200000
  },
  {
    id: 'notif-2',
    animeId: 'ashfall-district',
    animeTitle: 'Ashfall District',
    episodeNum: 8,
    message: 'Episode 8 simulcast broadcast scheduled for tomorrow 18:30 JST.',
    timeAgo: '5h ago',
    read: false,
    timestamp: Date.now() - 18000000
  },
  {
    id: 'notif-3',
    animeId: 'iron-tide',
    animeTitle: 'Iron Tide',
    episodeNum: 14,
    message: 'Added to your Plan to Watch tracker list. New episode drops Saturday.',
    timeAgo: '1d ago',
    read: true,
    timestamp: Date.now() - 86400000
  }
];

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
  setAnimeTrackerStatus: (animeId: string, status: TrackerStatus | null) => void;
  getAnimeTrackerStatus: (animeId: string) => TrackerStatus | undefined;

  // Simulcast Notifications
  subscribedAnimeIds: string[];
  toggleNotificationSubscription: (animeId: string) => void;
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

  useEffect(() => {
    try {
      const rawWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (rawWatchlist) {
        setWatchlist(JSON.parse(rawWatchlist));
      } else {
        const defaultList = ['kamui', 'ashfall-district', 'paper-moon-society'];
        setWatchlist(defaultList);
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(defaultList));
      }

      const rawContinue = localStorage.getItem(CONTINUE_STORAGE_KEY);
      if (rawContinue) {
        setContinueWatching(JSON.parse(rawContinue));
      } else {
        const defaultContinue: ContinueWatchingItem[] = [
          {
            animeId: 'kamui',
            episodeNum: 1,
            currentTime: 620,
            duration: 1440,
            percentage: 43,
            title: 'Kamui',
            episodeTitle: 'Ep. 1 · The Bell of Frozen Ash',
            updatedAt: Date.now()
          },
          {
            animeId: 'ashfall-district',
            episodeNum: 2,
            currentTime: 890,
            duration: 1380,
            percentage: 65,
            title: 'Ashfall District',
            episodeTitle: 'Ep. 2 · Sub-Level Zero',
            updatedAt: Date.now() - 3600000
          }
        ];
        setContinueWatching(defaultContinue);
        localStorage.setItem(CONTINUE_STORAGE_KEY, JSON.stringify(defaultContinue));
      }

      const rawLikes = localStorage.getItem(LIKED_STORAGE_KEY);
      if (rawLikes) {
        setLikedTitles(JSON.parse(rawLikes));
      } else {
        const defaultLikes = ['kamui', 'nine-crows-inn'];
        setLikedTitles(defaultLikes);
        localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(defaultLikes));
      }

      const rawTracker = localStorage.getItem(TRACKER_STORAGE_KEY);
      if (rawTracker) {
        setTrackerStatus(JSON.parse(rawTracker));
      } else {
        const defaultTracker: Record<string, TrackerStatus> = {
          kamui: 'watching',
          'ashfall-district': 'watching',
          'iron-tide': 'planning'
        };
        setTrackerStatus(defaultTracker);
        localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(defaultTracker));
      }

      const rawSubbed = localStorage.getItem(NOTIF_SUBS_KEY);
      if (rawSubbed) {
        setSubscribedAnimeIds(JSON.parse(rawSubbed));
      } else {
        const defaultSubbed = ['kamui', 'ashfall-district'];
        setSubscribedAnimeIds(defaultSubbed);
        localStorage.setItem(NOTIF_SUBS_KEY, JSON.stringify(defaultSubbed));
      }

      const rawNotifs = localStorage.getItem(NOTIFS_LIST_KEY);
      if (rawNotifs) {
        setNotifications(JSON.parse(rawNotifs));
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS);
        localStorage.setItem(NOTIFS_LIST_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      }
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

  const clearLikedTitles = useCallback(() => {
    setLikedTitles([]);
    try {
      localStorage.removeItem(LIKED_STORAGE_KEY);
    } catch (e) {}
    showToast('Liked anime list cleared', 'info');
  }, [showToast]);

  // Anime Tracker Handlers
  const setAnimeTrackerStatus = useCallback(
    (animeId: string, status: TrackerStatus | null) => {
      const anime = ANIME_CATALOG[animeId];
      setTrackerStatus((prev) => {
        const next = { ...prev };
        if (!status) {
          delete next[animeId];
          try {
            localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(next));
          } catch (e) {}
          if (anime) showToast(`Removed "${anime.title}" from your Tracker`, 'info');
        } else {
          next[animeId] = status;
          try {
            localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(next));
          } catch (e) {}
          const labels: Record<TrackerStatus, string> = {
            watching: 'Watching',
            planning: 'Plan to Watch',
            completed: 'Completed',
            on_hold: 'On Hold',
            dropped: 'Dropped'
          };
          if (anime) showToast(`Marked "${anime.title}" as ${labels[status]}`, 'success');
        }
        return next;
      });
    },
    [showToast]
  );

  const getAnimeTrackerStatus = useCallback(
    (animeId: string): TrackerStatus | undefined => {
      return trackerStatus[animeId];
    },
    [trackerStatus]
  );

  // Simulcast Notifications Handlers
  const toggleNotificationSubscription = useCallback(
    (animeId: string) => {
      const anime = ANIME_CATALOG[animeId];
      setSubscribedAnimeIds((prev) => {
        const isSubbed = prev.includes(animeId);
        const next = isSubbed ? prev.filter((id) => id !== animeId) : [...prev, animeId];
        try {
          localStorage.setItem(NOTIF_SUBS_KEY, JSON.stringify(next));
        } catch (e) {}

        if (!isSubbed && anime) {
          showToast(`Simulcast alerts enabled for "${anime.title}"`, 'success');
          const newNotif: AnimeNotification = {
            id: `sub-${animeId}-${Date.now()}`,
            animeId,
            animeTitle: anime.title,
            episodeNum: anime.nextAiring?.episode || 1,
            message: `Simulcast alerts active: Episode ${anime.nextAiring?.episode || 2} drops ${anime.nextAiring?.timeStr || 'soon'}.`,
            timeAgo: 'Just now',
            read: false,
            timestamp: Date.now()
          };
          setNotifications((n) => {
            const updated = [newNotif, ...n.filter((item) => item.id !== newNotif.id)].slice(0, 20);
            try {
              localStorage.setItem(NOTIFS_LIST_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        } else if (anime) {
          showToast(`Alerts disabled for "${anime.title}"`, 'info');
        }
        return next;
      });
    },
    [showToast]
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
      } catch (e) {}
      return next;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(NOTIFS_LIST_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(NOTIFS_LIST_KEY);
    } catch (e) {}
    showToast('Notifications cleared', 'info');
  }, [showToast]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;


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
