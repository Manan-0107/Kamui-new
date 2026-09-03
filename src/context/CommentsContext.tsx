'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AnimeComment, CommentMedia } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const COMMENTS_STORAGE_KEY = 'kamui_anime_comments';

// Pre-seeded anime discussion threads
const DEFAULT_COMMENTS: Record<string, AnimeComment[]> = {
  kamui: [
    {
      id: 'c-kamui-1',
      animeId: 'kamui',
      epNum: 1,
      timestamp: '04:22',
      author: {
        name: 'Rin Tohsaka',
        avatar: '/avatars/nami.svg',
        badge: 'TOP FAN'
      },
      content: 'The sakuga in the opening snow battle scene was pure cinema! ufotable level animation here 🔥✨',
      media: {
        type: 'sticker',
        url: '🔥',
        name: 'Flame Hype'
      },
      createdAt: '15m ago',
      likes: 42,
      isLiked: false,
      replies: [
        {
          id: 'c-kamui-1-1',
          animeId: 'kamui',
          epNum: 1,
          author: {
            name: 'Gojo Satoru',
            avatar: '/avatars/zoro.svg',
            badge: 'PRO'
          },
          content: 'The sound design with Dolby Atmos when the shrine bell rings gave me literal chills.',
          createdAt: '8m ago',
          likes: 19,
          isLiked: false
        }
      ]
    },
    {
      id: 'c-kamui-2',
      animeId: 'kamui',
      epNum: 1,
      timestamp: '18:50',
      author: {
        name: 'Tanjiro Kamado',
        avatar: '/avatars/luffy.svg',
        badge: 'OTAKU'
      },
      content: 'Here is my fan sketch of the exiled wolf-god spirit! Hope you guys like it!',
      media: {
        type: 'image',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="100%" height="100%" fill="%230c1420"/><circle cx="300" cy="170" r="110" fill="%23e8b94f" opacity="0.25"/><path d="M220 230 L300 110 L380 230 Z" fill="%23e8b94f"/><text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16" font-weight="bold">Wolf God Kamui - Fan Art by Tanjiro</text></svg>',
        name: 'kamui-fan-art.png'
      },
      createdAt: '1h ago',
      likes: 88,
      isLiked: false
    },
    {
      id: 'c-kamui-3',
      animeId: 'kamui',
      epNum: 2,
      author: {
        name: 'Mikasa Ackerman',
        avatar: '/avatars/nami.svg'
      },
      content: 'Major plot twist revealed at the end of episode 2. The debt between the wolf god and the shrine girl was forged centuries ago during the great winter freeze!',
      createdAt: '3h ago',
      likes: 31,
      isSpoiler: true,
      isLiked: false
    }
  ],
  'ashfall-district': [
    {
      id: 'c-ashfall-1',
      animeId: 'ashfall-district',
      epNum: 1,
      timestamp: '12:04',
      author: {
        name: 'Senku Ishigami',
        avatar: '/avatars/luffy.svg',
        badge: 'VIP'
      },
      content: 'The cyberpunk world building with the neon ash rain is ten billion percent aesthetic ⚡🏙️',
      media: {
        type: 'sticker',
        url: '⚡',
        name: 'Cyber Shock'
      },
      createdAt: '45m ago',
      likes: 54,
      isLiked: false
    }
  ],
  'paper-moon-society': [
    {
      id: 'c-papermoon-1',
      animeId: 'paper-moon-society',
      epNum: 1,
      author: {
        name: 'Marin Kitagawa',
        avatar: '/avatars/nami.svg',
        badge: 'TOP FAN'
      },
      content: 'The cozy slice-of-life vibes and the origami magic academy are so soothing to watch before sleep 🌸☕',
      createdAt: '2h ago',
      likes: 27,
      isLiked: false
    }
  ]
};

interface CommentsContextType {
  comments: Record<string, AnimeComment[]>;
  getComments: (animeId: string, epNum?: number) => AnimeComment[];
  addComment: (
    animeId: string,
    content: string,
    options?: {
      epNum?: number;
      timestamp?: string;
      media?: CommentMedia;
      isSpoiler?: boolean;
      parentId?: string;
    }
  ) => void;
  likeComment: (animeId: string, commentId: string) => void;
  deleteComment: (animeId: string, commentId: string) => void;
  isLiveChatOpen: boolean;
  toggleLiveChat: () => void;
  openLiveChat: () => void;
  closeLiveChat: () => void;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const CommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<Record<string, AnimeComment[]>>(DEFAULT_COMMENTS);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setComments((prev) => ({ ...DEFAULT_COMMENTS, ...parsed }));
      } else {
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_COMMENTS));
      }
    } catch (e) {
      setComments(DEFAULT_COMMENTS);
    }
  }, []);

  const saveToStorage = (updated: Record<string, AnimeComment[]>) => {
    setComments(updated);
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const getComments = useCallback(
    (animeId: string, epNum?: number): AnimeComment[] => {
      const animeThread = comments[animeId] || DEFAULT_COMMENTS[animeId] || [];
      if (typeof epNum === 'number') {
        return animeThread.filter((c) => !c.epNum || c.epNum === epNum);
      }
      return animeThread;
    },
    [comments]
  );

  const addComment = useCallback(
    (
      animeId: string,
      content: string,
      options?: {
        epNum?: number;
        timestamp?: string;
        media?: CommentMedia;
        isSpoiler?: boolean;
        parentId?: string;
      }
    ) => {
      if (!content.trim() && !options?.media) {
        showToast('Please type a comment or attach media/sticker', 'warning');
        return;
      }

      const authorName = user?.name || 'Anime Streamer';
      const authorAvatar = user?.avatar || '/avatars/nami.svg';

      const newComment: AnimeComment = {
        id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        animeId,
        epNum: options?.epNum || 1,
        timestamp: options?.timestamp,
        author: {
          name: authorName,
          avatar: authorAvatar,
          badge: user?.loggedIn ? 'MEMBER' : 'GUEST',
          isCurrentUser: true
        },
        content: content.trim(),
        media: options?.media,
        createdAt: 'Just now',
        likes: 1,
        isLiked: true,
        isSpoiler: options?.isSpoiler || false,
        replies: []
      };

      setComments((prev) => {
        const list = [...(prev[animeId] || [])];
        if (options?.parentId) {
          // Add as reply
          const parentIdx = list.findIndex((c) => c.id === options.parentId);
          if (parentIdx !== -1) {
            const parent = { ...list[parentIdx] };
            parent.replies = [...(parent.replies || []), newComment];
            list[parentIdx] = parent;
          } else {
            list.unshift(newComment);
          }
        } else {
          list.unshift(newComment);
        }

        const updated = { ...prev, [animeId]: list };
        saveToStorage(updated);
        return updated;
      });

      showToast('Comment posted to community thread! 💬', 'success');
    },
    [user, showToast]
  );

  const likeComment = useCallback(
    (animeId: string, commentId: string) => {
      setComments((prev) => {
        const list = [...(prev[animeId] || [])];
        const mutateList = (items: AnimeComment[]): AnimeComment[] => {
          return items.map((item) => {
            if (item.id === commentId) {
              const currentlyLiked = !!item.isLiked;
              return {
                ...item,
                isLiked: !currentlyLiked,
                likes: currentlyLiked ? Math.max(0, item.likes - 1) : item.likes + 1
              };
            }
            if (item.replies && item.replies.length > 0) {
              return {
                ...item,
                replies: mutateList(item.replies)
              };
            }
            return item;
          });
        };

        const updatedList = mutateList(list);
        const updated = { ...prev, [animeId]: updatedList };
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const deleteComment = useCallback(
    (animeId: string, commentId: string) => {
      setComments((prev) => {
        const list = (prev[animeId] || []).filter((c) => c.id !== commentId);
        const updated = { ...prev, [animeId]: list };
        saveToStorage(updated);
        return updated;
      });
      showToast('Comment removed', 'info');
    },
    [showToast]
  );

  const toggleLiveChat = useCallback(() => setIsLiveChatOpen((prev) => !prev), []);
  const openLiveChat = useCallback(() => setIsLiveChatOpen(true), []);
  const closeLiveChat = useCallback(() => setIsLiveChatOpen(false), []);

  return (
    <CommentsContext.Provider
      value={{
        comments,
        getComments,
        addComment,
        likeComment,
        deleteComment,
        isLiveChatOpen,
        toggleLiveChat,
        openLiveChat,
        closeLiveChat
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const ctx = useContext(CommentsContext);
  if (!ctx) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return ctx;
};
