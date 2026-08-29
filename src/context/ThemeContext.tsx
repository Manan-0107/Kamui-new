'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RealmTheme, RealmThemeId } from '@/lib/types';
import { REALM_THEMES, THEME_STORAGE_KEY } from '@/lib/themes';
import { useToast } from './ToastContext';

interface ThemeContextType {
  currentThemeId: RealmThemeId;
  currentTheme: RealmTheme;
  cycleTheme: (notify?: boolean) => void;
  setTheme: (id: RealmThemeId, notify?: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<RealmThemeId>('kamui-gold');
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as RealmThemeId | null;
      if (saved && REALM_THEMES.some((t) => t.id === saved)) {
        setThemeId(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'kamui-gold');
      }
    } catch (e) {}
  }, []);

  const setTheme = useCallback(
    (id: RealmThemeId, notify = false) => {
      const target = REALM_THEMES.find((t) => t.id === id) || REALM_THEMES[0];
      setThemeId(target.id);
      document.documentElement.setAttribute('data-theme', target.id);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, target.id);
      } catch (e) {}

      // Dispatch global window event for ember canvas
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('kamui-theme-changed', {
            detail: { themeId: target.id, hues: target.hues }
          })
        );
      }

      if (notify) {
        showToast(`✦ Realm shifted to ${target.name}!`, 'info');
      }
    },
    [showToast]
  );

  const cycleTheme = useCallback(
    (notify = true) => {
      const currentIdx = REALM_THEMES.findIndex((t) => t.id === themeId);
      const nextIdx = (currentIdx + 1) % REALM_THEMES.length;
      const nextTheme = REALM_THEMES[nextIdx];
      setTheme(nextTheme.id, notify);
    },
    [themeId, setTheme]
  );

  const currentTheme = REALM_THEMES.find((t) => t.id === themeId) || REALM_THEMES[0];

  return (
    <ThemeContext.Provider value={{ currentThemeId: themeId, currentTheme, cycleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
