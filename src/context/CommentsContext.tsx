'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AnimeComment, CommentMedia } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const COMMENTS_STORAGE_KEY = 'kamui_anime_comments';

const DEFAULT_COMMENTS: Record<string, AnimeComment[]> = {};

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
  const [comments, setComments] = useState<Record<string, AnimeComment[]>>({});
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  // Load from localStorage and filter out legacy string IDs
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid: Record<string, AnimeComment[]> = {};
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            if (/^\d+$/.test(k) && Array.isArray(v)) {
              valid[k] = v;
            }
          }
        }
        setComments(valid);
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(valid));
      }
    } catch {}
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

      showToast('Comment posted to community thread.', 'success');
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
