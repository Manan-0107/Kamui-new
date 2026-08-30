'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession } from '@/lib/types';
import { getRandomDefaultAvatar } from '@/lib/avatars';
import { useToast } from './ToastContext';

const AUTH_STORAGE_KEY = 'kamui_user_session';
const ACCOUNTS_STORAGE_KEY = 'kamui_registered_accounts';

interface AuthModalConfig {
  isOpen: boolean;
  heading?: string;
  sub?: string;
  redirectUrl?: string;
  defaultTab?: 'signin' | 'signup';
}

interface GoogleModalConfig {
  isOpen: boolean;
  redirectUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  login: (name: string, email?: string, avatar?: string, provider?: 'google' | 'password') => void;
  logout: () => void;
  updateAvatar: (newAvatarSrc: string, customLabel?: string) => void;
  updateSocials: (newSocials: UserSession['socials']) => void;
  authModal: AuthModalConfig;
  openAuthModal: (heading?: string, sub?: string, redirectUrl?: string, defaultTab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  googleModal: GoogleModalConfig;
  openGoogleModal: (redirectUrl?: string) => void;
  closeGoogleModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  registeredAccounts: UserSession[];
  findAccount: (query: string) => UserSession | null;
  parseUserDisplayName: (input: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [registeredAccounts, setRegisteredAccounts] = useState<UserSession[]>([]);
  const [authModal, setAuthModal] = useState<AuthModalConfig>({ isOpen: false });
  const [googleModal, setGoogleModal] = useState<GoogleModalConfig>({ isOpen: false });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { showToast } = useToast();

  const getSavedAccounts = (): UserSession[] => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveAccount = (account: UserSession) => {
    if (!account || !account.name) return;
    const accounts = getSavedAccounts();
    const existingIdx = accounts.findIndex(
      (acc) =>
        (account.email && acc.email && acc.email.toLowerCase() === account.email.toLowerCase()) ||
        (acc.name && acc.name.toLowerCase() === account.name.toLowerCase())
    );
    let updated: UserSession[];
    if (existingIdx >= 0) {
      updated = [...accounts];
      updated[existingIdx] = { ...updated[existingIdx], ...account };
    } else {
      updated = [...accounts, account];
    }
    setRegisteredAccounts(updated);
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  useEffect(() => {
    try {
      const savedAccounts = getSavedAccounts();
      setRegisteredAccounts(savedAccounts);

      const rawUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && !parsed.avatar) {
          parsed.avatar = getRandomDefaultAvatar();
        }
        setUser(parsed);
      }
    } catch (e) {}
  }, []);

  const findAccount = useCallback(
    (query: string): UserSession | null => {
      if (!query) return null;
      const q = query.trim().toLowerCase();
      const accounts = getSavedAccounts();
      return (
        accounts.find(
          (acc) =>
            (acc.email && acc.email.toLowerCase() === q) ||
            (acc.name && acc.name.toLowerCase() === q)
        ) || null
      );
    },
    []
  );

  const parseUserDisplayName = useCallback(
    (input: string): string => {
      if (!input) return 'Member';
      const clean = input.trim();
      if (!clean) return 'Member';

      const existing = findAccount(clean);
      if (existing && existing.name) {
        return existing.name;
      }

      if (clean.includes('@')) {
        const prefix = clean.split('@')[0];
        const parts = prefix.split(/[._\-+]/).filter(Boolean);
        if (parts.length > 0) {
          return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
        }
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }

      if (clean === clean.toLowerCase()) {
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }
      return clean;
    },
    [findAccount]
  );

  const login = useCallback(
    (name: string, email?: string, avatar?: string, provider: 'google' | 'password' = 'password') => {
      const existing = findAccount(email || name);
      const userSession: UserSession = {
        name: name || (existing ? existing.name : 'Member'),
        email: email || (existing && existing.email ? existing.email : `${(name || 'member').toLowerCase()}@kamui.stream`),
        avatar: avatar || (existing && existing.avatar ? existing.avatar : getRandomDefaultAvatar()),
        loggedIn: true,
        authProvider: provider
      };

      setUser(userSession);
      saveAccount(userSession);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession));
      } catch (e) {}

      showToast(`Welcome to Kamui, ${userSession.name}!`, 'success');
    },
    [findAccount, showToast]
  );

  const logout = useCallback(() => {
    const currentName = user ? user.name : 'Member';
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
    showToast(`Signed out (${currentName})`, 'info');
  }, [user, showToast]);

  const updateAvatar = useCallback(
    (newAvatarSrc: string, customLabel?: string) => {
      if (!user) return;
      const updatedUser: UserSession = { ...user, avatar: newAvatarSrc };
      setUser(updatedUser);
      saveAccount(updatedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (e) {}
      showToast(`Profile picture set to ${customLabel || 'custom photo'}!`, 'success');
    },
    [user, showToast]
  );

  const updateSocials = useCallback(
    (newSocials: UserSession['socials']) => {
      if (!user) return;
      const updatedUser: UserSession = { ...user, socials: { ...user.socials, ...newSocials } };
      setUser(updatedUser);
      saveAccount(updatedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (e) {}
      showToast('Profile socials & bio updated!', 'success');
    },
    [user, showToast]
  );

  const openProfileModal = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  const openAuthModal = useCallback(
    (heading?: string, sub?: string, redirectUrl = '/watch', defaultTab: 'signin' | 'signup' = 'signin') => {
      setAuthModal({
        isOpen: true,
        heading,
        sub,
        redirectUrl,
        defaultTab
      });
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openGoogleModal = useCallback((redirectUrl = '/watch') => {
    setGoogleModal({ isOpen: true, redirectUrl });
  }, []);

  const closeGoogleModal = useCallback(() => {
    setGoogleModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateAvatar,
        updateSocials,
        authModal,
        openAuthModal,
        closeAuthModal,
        googleModal,
        openGoogleModal,
        closeGoogleModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        registeredAccounts,
        findAccount,
        parseUserDisplayName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
