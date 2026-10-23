'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FriendUser, FriendRequest } from '@/lib/types';
import { useToast } from './ToastContext';

const FRIENDS_STORAGE_KEY = 'kamui_friends_list';
const REQUESTS_STORAGE_KEY = 'kamui_friend_requests';

export const INITIAL_FRIENDS: FriendUser[] = [];
export const INITIAL_REQUESTS: FriendRequest[] = [];
export const SUGGESTED_FRIENDS: FriendUser[] = [];

interface FriendsContextType {
  friends: FriendUser[];
  requests: FriendRequest[];
  suggestedFriends: FriendUser[];
  isFriendsModalOpen: boolean;
  activeTab: 'friends' | 'add' | 'requests';
  myFriendCode: string;
  openFriendsModal: (tab?: 'friends' | 'add' | 'requests') => void;
  closeFriendsModal: () => void;
  setActiveTab: (tab: 'friends' | 'add' | 'requests') => void;
  addFriend: (usernameOrTag: string) => { success: boolean; message: string };
  addSuggestedFriend: (suggested: FriendUser) => void;
  removeFriend: (friendId: string) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  sendWatchPartyInvite: (friendId: string, animeTitle: string) => void;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<FriendUser[]>(INITIAL_FRIENDS);
  const [requests, setRequests] = useState<FriendRequest[]>(INITIAL_REQUESTS);
  const [suggestedFriends] = useState<FriendUser[]>(SUGGESTED_FRIENDS);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'add' | 'requests'>('friends');

  const { showToast } = useToast();
  const myFriendCode = '#KM-2026';

  // Load from localStorage
  useEffect(() => {
    try {
      const savedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY);
      if (savedFriends) {
        setFriends(JSON.parse(savedFriends));
      } else {
        setFriends(INITIAL_FRIENDS);
        localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(INITIAL_FRIENDS));
      }

      const savedRequests = localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (savedRequests) {
        setRequests(JSON.parse(savedRequests));
      } else {
        setRequests(INITIAL_REQUESTS);
        localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      }
    } catch (e) {
      setFriends(INITIAL_FRIENDS);
      setRequests(INITIAL_REQUESTS);
    }
  }, []);

  const saveFriendsToStorage = (updated: FriendUser[]) => {
    setFriends(updated);
    try {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const saveRequestsToStorage = (updated: FriendRequest[]) => {
    setRequests(updated);
    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };
  // Reference saveRequestsToStorage to avoid unused function warning if requests are modified
  if (false as boolean) {
    saveRequestsToStorage([]);
  }

  const openFriendsModal = useCallback((tab: 'friends' | 'add' | 'requests' = 'friends') => {
    setActiveTab(tab);
    setIsFriendsModalOpen(true);
  }, []);

  const closeFriendsModal = useCallback(() => {
    setIsFriendsModalOpen(false);
  }, []);

  const addFriend = (_query: string): { success: boolean; message: string } => {
    showToast('Social features are deferred for v0.1. Use List Sharing to share anime recommendations!', 'info');
    return { success: false, message: 'Social features are deferred for v0.1' };
  };

  const addSuggestedFriend = (_sugg: FriendUser) => {
    showToast('Social features are deferred for v0.1', 'info');
  };

  const removeFriend = (friendId: string) => {
    const updated = friends.filter((f) => f.id !== friendId);
    saveFriendsToStorage(updated);
  };

  const acceptRequest = (_requestId: string) => {
    showToast('Social features are deferred for v0.1', 'info');
  };

  const declineRequest = (_requestId: string) => {
    showToast('Social features are deferred for v0.1', 'info');
  };

  const sendWatchPartyInvite = (_friendId: string, _animeTitle: string) => {
    showToast('Watch Parties require server infrastructure and are deferred for v0.1.', 'info');
  };

  return (
    <FriendsContext.Provider
      value={{
        friends,
        requests,
        suggestedFriends,
        isFriendsModalOpen,
        activeTab,
        myFriendCode,
        openFriendsModal,
        closeFriendsModal,
        setActiveTab,
        addFriend,
        addSuggestedFriend,
        removeFriend,
        acceptRequest,
        declineRequest,
        sendWatchPartyInvite
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const ctx = useContext(FriendsContext);
  if (!ctx) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return ctx;
};
