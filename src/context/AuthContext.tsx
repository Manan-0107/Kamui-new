'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession } from '@/lib/types';
import { getRandomDefaultAvatar } from '@/lib/avatars';
import { useToast } from './ToastContext';

const PROFILE_STORAGE_KEY = 'kamui_user_profile';

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
  updateName: (name: string) => void;
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
  isBackupModalOpen: boolean;
  openBackupModal: () => void;
  closeBackupModal: () => void;
  registeredAccounts: UserSession[];
  findAccount: (query: string) => UserSession | null;
  parseUserDisplayName: (input: string) => string;
}

const DEFAULT_LOCAL_USER: UserSession = {
  loggedIn: true,
  name: 'Local Otaku',
  email: '',
  avatar: '/avatars/nami.svg'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(DEFAULT_LOCAL_USER);
  const [authModal, setAuthModal] = useState<AuthModalConfig>({ isOpen: false });
  const [googleModal, setGoogleModal] = useState<GoogleModalConfig>({ isOpen: false });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.avatar) parsed.avatar = getRandomDefaultAvatar();
          setUser({ ...DEFAULT_LOCAL_USER, ...parsed, loggedIn: true });
          return;
        }
      }
      // If none saved, initialize default local profile
      setUser(DEFAULT_LOCAL_USER);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_LOCAL_USER));
    } catch {
      setUser(DEFAULT_LOCAL_USER);
    }
  }, []);

  const saveProfile = useCallback((profile: UserSession) => {
    setUser(profile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, []);

  const updateName = useCallback(
    (name: string) => {
      const clean = name.trim() || 'Local Otaku';
      const updated: UserSession = {
        ...(user || DEFAULT_LOCAL_USER),
        name: clean
      };
      saveProfile(updated);
      showToast(`Profile name updated to ${clean}`, 'success');
    },
    [user, saveProfile, showToast]
  );

  const updateAvatar = useCallback(
    (newAvatarSrc: string, customLabel?: string) => {
      const updated: UserSession = {
        ...(user || DEFAULT_LOCAL_USER),
        avatar: newAvatarSrc
      };
      saveProfile(updated);
      showToast(`Avatar set to ${customLabel || 'custom photo'}!`, 'success');
    },
    [user, saveProfile, showToast]
  );

  const updateSocials = useCallback(
    (newSocials: UserSession['socials']) => {
      const updated: UserSession = {
        ...(user || DEFAULT_LOCAL_USER),
        socials: { ...(user?.socials || {}), ...newSocials }
      };
      saveProfile(updated);
      showToast('Profile socials & bio saved locally!', 'success');
    },
    [user, saveProfile, showToast]
  );

  const login = useCallback(
    (name: string, _email?: string, avatar?: string) => {
      const clean = name.trim() || 'Local Otaku';
      const updated: UserSession = {
        ...(user || DEFAULT_LOCAL_USER),
        name: clean,
        avatar: avatar || user?.avatar || getRandomDefaultAvatar(),
        loggedIn: true
      };
      saveProfile(updated);
      showToast(`Local profile set to ${clean}!`, 'success');
    },
    [user, saveProfile, showToast]
  );

  const logout = useCallback(() => {
    saveProfile(DEFAULT_LOCAL_USER);
    showToast('Local profile reset to default.', 'info');
  }, [saveProfile, showToast]);

  const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);

  const openBackupModal = useCallback(() => setIsBackupModalOpen(true), []);
  const closeBackupModal = useCallback(() => setIsBackupModalOpen(false), []);

  const openAuthModal = useCallback(() => {
    // Kamui v0.1 is local-first, no accounts needed. Open profile modal instead.
    setIsProfileModalOpen(true);
    showToast('Kamui v0.1 is local-first! No account or sign-in required.', 'info');
  }, [showToast]);

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openGoogleModal = useCallback(() => {
    showToast('Google Sign-In is disabled in v0.1. Kamui is 100% local-first and requires no account.', 'info');
  }, [showToast]);

  const closeGoogleModal = useCallback(() => {
    setGoogleModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const findAccount = useCallback(() => null, []);

  const parseUserDisplayName = useCallback((input: string): string => {
    if (!input) return 'Anime Fan';
    const clean = input.trim();
    if (!clean) return 'Anime Fan';
    if (clean.includes('@')) {
      const prefix = clean.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateName,
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
        isBackupModalOpen,
        openBackupModal,
        closeBackupModal,
        registeredAccounts: user ? [user] : [],
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
