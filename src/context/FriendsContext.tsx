'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FriendUser, FriendRequest } from '@/lib/types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const FRIENDS_STORAGE_KEY = 'kamui_friends_list';
const REQUESTS_STORAGE_KEY = 'kamui_friend_requests';

const INITIAL_FRIENDS: FriendUser[] = [
  {
    id: 'friend-1',
    username: 'Rin_Tohsaka',
    displayName: 'Rin Tohsaka',
    tag: '#KM-1082',
    avatar: '/avatars/nami.svg',
    status: 'watching',
    currentAnime: 'Kamui',
    currentEp: 4,
    favoriteAnime: 'Kamui',
    bio: 'Top tier mage. Watching Simulcasts every night in 4K.',
    mutualFriends: 8,
    joinedAt: '2025-11-12'
  },
  {
    id: 'friend-2',
    username: 'Tanjiro_99',
    displayName: 'Tanjiro Kamado',
    tag: '#KM-4521',
    avatar: '/avatars/luffy.svg',
    status: 'watching',
    currentAnime: 'Ashfall District',
    currentEp: 2,
    favoriteAnime: 'Ashfall District',
    bio: 'Never give up! Streaming with zero ads.',
    mutualFriends: 14,
    joinedAt: '2026-01-05'
  },
  {
    id: 'friend-3',
    username: 'Mikasa_A',
    displayName: 'Mikasa Ackerman',
    tag: '#KM-8910',
    avatar: '/avatars/nami.svg',
    status: 'online',
    favoriteAnime: 'Paper Moon Society',
    bio: 'Don’t skip the opening theme.',
    mutualFriends: 5,
    joinedAt: '2025-08-20'
  },
  {
    id: 'friend-4',
    username: 'Gojo_Satoru',
    displayName: 'Satoru Gojo',
    tag: '#KM-7777',
    avatar: '/avatars/zoro.svg',
    status: 'watching',
    currentAnime: 'Iron Tide',
    currentEp: 6,
    favoriteAnime: 'Iron Tide',
    bio: 'Throughout heaven and earth, I alone am the binge watcher.',
    mutualFriends: 22,
    joinedAt: '2025-04-18'
  },
  {
    id: 'friend-5',
    username: 'Luffy_King',
    displayName: 'Monkey D. Luffy',
    tag: '#KM-5670',
    avatar: '/avatars/luffy.svg',
    status: 'idle',
    favoriteAnime: 'Nine Crows Inn',
    bio: 'I am gonna be the King of Anime Streamers!',
    mutualFriends: 19,
    joinedAt: '2025-02-10'
  }
];

const INITIAL_REQUESTS: FriendRequest[] = [
  {
    id: 'req-1',
    sentAt: '10m ago',
    type: 'incoming',
    from: {
      id: 'user-zoro',
      username: 'Zoro_Swordsman',
      displayName: 'Roronoa Zoro',
      tag: '#KM-3321',
      avatar: '/avatars/zoro.svg',
      status: 'online',
      bio: 'Got lost on the way to the watch page. Add me.',
      mutualFriends: 7
    }
  },
  {
    id: 'req-2',
    sentAt: '2h ago',
    type: 'incoming',
    from: {
      id: 'user-marin',
      username: 'Marin_Kitagawa',
      displayName: 'Marin Kitagawa',
      tag: '#KM-3141',
      avatar: '/avatars/nami.svg',
      status: 'watching',
      currentAnime: 'Glasshouse',
      currentEp: 3,
      bio: 'Cosplayer & Anime enthusiast! Let’s watch together ✨',
      mutualFriends: 11
    }
  }
];

export const SUGGESTED_FRIENDS: FriendUser[] = [
  {
    id: 'sugg-1',
    username: 'Killua_Zoldyck',
    displayName: 'Killua Zoldyck',
    tag: '#KM-9922',
    avatar: '/avatars/zoro.svg',
    status: 'online',
    favoriteAnime: 'Static Requiem',
    bio: 'Assassination skills & 4K streaming.',
    mutualFriends: 9
  },
  {
    id: 'sugg-2',
    username: 'Senku_Ishigami',
    displayName: 'Senku Ishigami',
    tag: '#KM-1000',
    avatar: '/avatars/luffy.svg',
    status: 'online',
    favoriteAnime: 'Hollow Meridian',
    bio: 'Ten billion percent into sci-fi anime.',
    mutualFriends: 12
  },
  {
    id: 'sugg-3',
    username: 'Megumi_Fushiguro',
    displayName: 'Megumi Fushiguro',
    tag: '#KM-6543',
    avatar: '/avatars/zoro.svg',
    status: 'idle',
    favoriteAnime: 'Long Thaw',
    bio: 'Shadow technique practitioner. Quiet watcher.',
    mutualFriends: 4
  }
];

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
  const [suggestedFriends, setSuggestedFriends] = useState<FriendUser[]>(SUGGESTED_FRIENDS);
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

  const openFriendsModal = useCallback((tab: 'friends' | 'add' | 'requests' = 'friends') => {
    setActiveTab(tab);
    setIsFriendsModalOpen(true);
  }, []);

  const closeFriendsModal = useCallback(() => {
    setIsFriendsModalOpen(false);
  }, []);

  const addFriend = (query: string): { success: boolean; message: string } => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return { success: false, message: 'Please enter a username or Kamui ID' };
    }

    // Check if already friends
    const exists = friends.some(
      (f) =>
        f.username.toLowerCase() === cleanQuery.toLowerCase() ||
        f.tag.toLowerCase() === cleanQuery.toLowerCase()
    );
    if (exists) {
      showToast(`You are already friends with ${cleanQuery}!`, 'info');
      return { success: false, message: 'Already friends' };
    }

    // Check suggested pool
    const matchSugg = suggestedFriends.find(
      (s) =>
        s.username.toLowerCase() === cleanQuery.toLowerCase() ||
        s.tag.toLowerCase() === cleanQuery.toLowerCase()
    );

    const newFriend: FriendUser = matchSugg || {
      id: `custom-${Date.now()}`,
      username: cleanQuery.replace(/^@/, ''),
      displayName: cleanQuery.replace(/^@/, ''),
      tag: cleanQuery.startsWith('#') ? cleanQuery : `#KM-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: '/avatars/nami.svg',
      status: 'online',
      bio: 'Kamui anime enthusiast',
      mutualFriends: Math.floor(Math.random() * 8) + 1,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newFriend, ...friends];
    saveFriendsToStorage(updated);

    if (matchSugg) {
      setSuggestedFriends((prev) => prev.filter((s) => s.id !== matchSugg.id));
    }

    showToast(`Friend request sent & connected with ${newFriend.displayName}! 🎉`, 'success');
    return { success: true, message: `Added ${newFriend.displayName}` };
  };

  const addSuggestedFriend = (sugg: FriendUser) => {
    const updated = [sugg, ...friends];
    saveFriendsToStorage(updated);
    setSuggestedFriends((prev) => prev.filter((s) => s.id !== sugg.id));
    showToast(`Added ${sugg.displayName} to your friends! ✨`, 'success');
  };

  const removeFriend = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    const updated = friends.filter((f) => f.id !== friendId);
    saveFriendsToStorage(updated);
    showToast(`Removed ${friend?.displayName || 'user'} from friends`, 'info');
  };

  const acceptRequest = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const newFriend: FriendUser = {
      ...req.from,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    const updatedFriends = [newFriend, ...friends];
    saveFriendsToStorage(updatedFriends);

    const updatedRequests = requests.filter((r) => r.id !== requestId);
    saveRequestsToStorage(updatedRequests);

    showToast(`Accepted friend request from ${req.from.displayName}! 🎊`, 'success');
  };

  const declineRequest = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    const updatedRequests = requests.filter((r) => r.id !== requestId);
    saveRequestsToStorage(updatedRequests);
    showToast(`Declined request from ${req?.from.displayName || 'user'}`, 'info');
  };

  const sendWatchPartyInvite = (friendId: string, animeTitle: string) => {
    const friend = friends.find((f) => f.id === friendId);
    showToast(`Watch Party invitation sent to ${friend?.displayName || 'Friend'} for ${animeTitle}! 🍿`, 'success');
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
