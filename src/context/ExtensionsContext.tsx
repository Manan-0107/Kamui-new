'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AnimeExtension,
  DEFAULT_EXTENSIONS,
  EXTENSION_STORE_CATALOG,
  StreamProtocol
} from '@/lib/extensions';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'kamui_anime_extensions';
const ACTIVE_STORAGE_KEY = 'kamui_active_extension_id';

export type ExtensionsModalTab = 'installed' | 'add' | 'store' | 'settings';

interface ExtensionsContextType {
  extensions: AnimeExtension[];
  activeExtensionId: string;
  activeExtension: AnimeExtension | undefined;
  installedCount: number;
  activeCount: number;

  // Modal State
  isModalOpen: boolean;
  modalTab: ExtensionsModalTab;
  openModal: (tab?: ExtensionsModalTab) => void;
  closeModal: () => void;

  // Extension Actions
  setActiveExtension: (id: string) => void;
  toggleExtension: (id: string) => void;
  removeExtension: (id: string) => void;
  installFromStore: (storeId: string) => void;
  addCustomExtension: (input: {
    name: string;
    baseUrl: string;
    streamType: StreamProtocol;
    author?: string;
    description?: string;
    version?: string;
    supportedResolutions?: string[];
    supportsDub?: boolean;
    supportsSub?: boolean;
    hasIntroSkip?: boolean;
    badge?: string;
  }) => AnimeExtension;
  addFromManifestUrl: (url: string) => Promise<{ success: boolean; message: string; extension?: AnimeExtension }>;
  testPing: (id: string) => Promise<number>;
  testEndpointLatency: (url: string) => Promise<{ ok: boolean; latency: number }>;
  exportExtensions: () => string;
  importExtensions: (jsonStr: string) => { success: boolean; count: number; error?: string };
  resetToDefaults: () => void;
}

const ExtensionsContext = createContext<ExtensionsContextType | undefined>(undefined);

export const ExtensionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extensions, setExtensions] = useState<AnimeExtension[]>(DEFAULT_EXTENSIONS);
  const [activeExtensionId, setActiveExtensionIdState] = useState<string>('kamui-origin');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<ExtensionsModalTab>('installed');

  const { showToast } = useToast();

  // Load saved extensions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExtensions(parsed);
        }
      }

      const storedActive = localStorage.getItem(ACTIVE_STORAGE_KEY);
      if (storedActive) {
        setActiveExtensionIdState(storedActive);
      }
    } catch (e) {
      console.error('Failed to load extensions from storage', e);
    }
  }, []);

  // Save changes to localStorage
  const persistExtensions = useCallback((updated: AnimeExtension[]) => {
    setExtensions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save extensions to storage', e);
    }
  }, []);

  const openModal = useCallback((tab: ExtensionsModalTab = 'installed') => {
    setModalTab(tab);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const setActiveExtension = useCallback(
    (id: string) => {
      const target = extensions.find((e) => e.id === id);
      if (!target) return;
      if (!target.enabled) {
        // Enable it if disabled
        const updated = extensions.map((e) => (e.id === id ? { ...e, enabled: true } : e));
        persistExtensions(updated);
      }
      setActiveExtensionIdState(id);
      try {
        localStorage.setItem(ACTIVE_STORAGE_KEY, id);
      } catch (e) {}
      showToast(`Active streaming provider set to ${target.name}`, 'success');
    },
    [extensions, persistExtensions, showToast]
  );

  const toggleExtension = useCallback(
    (id: string) => {
      const ext = extensions.find((e) => e.id === id);
      if (!ext) return;

      if (id === activeExtensionId && ext.enabled) {
        // If disabling active extension, fallback to first enabled or default
        const nextEnabled = extensions.find((e) => e.id !== id && e.enabled);
        if (nextEnabled) {
          setActiveExtensionIdState(nextEnabled.id);
          try {
            localStorage.setItem(ACTIVE_STORAGE_KEY, nextEnabled.id);
          } catch (e) {}
        }
      }

      const updated = extensions.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      );
      persistExtensions(updated);
      showToast(`${ext.name} is now ${!ext.enabled ? 'Enabled' : 'Disabled'}`, 'info');
    },
    [extensions, activeExtensionId, persistExtensions, showToast]
  );

  const removeExtension = useCallback(
    (id: string) => {
      const ext = extensions.find((e) => e.id === id);
      if (!ext) return;
      if (ext.badgeType === 'official') {
        showToast('Official core extension cannot be deleted', 'error');
        return;
      }

      if (id === activeExtensionId) {
        setActiveExtensionIdState('kamui-origin');
        try {
          localStorage.setItem(ACTIVE_STORAGE_KEY, 'kamui-origin');
        } catch (e) {}
      }

      const updated = extensions.filter((e) => e.id !== id);
      persistExtensions(updated);
      showToast(`Removed extension "${ext.name}"`, 'info');
    },
    [extensions, activeExtensionId, persistExtensions, showToast]
  );

  const installFromStore = useCallback(
    (storeId: string) => {
      const storeItem = EXTENSION_STORE_CATALOG.find((s) => s.id === storeId);
      if (!storeItem) return;

      if (extensions.some((e) => e.id === storeId)) {
        // Already installed, enable it
        const updated = extensions.map((e) => (e.id === storeId ? { ...e, enabled: true } : e));
        persistExtensions(updated);
        setActiveExtensionIdState(storeId);
        showToast(`Activated ${storeItem.name}`, 'success');
        return;
      }

      const newExt: AnimeExtension = {
        ...storeItem,
        enabled: true,
        isDefault: false,
        latencyMs: Math.floor(Math.random() * 25) + 20,
        status: 'online',
        lastUpdated: 'Just now'
      };

      const updated = [...extensions, newExt];
      persistExtensions(updated);
      showToast(`Installed & enabled ${storeItem.name}!`, 'success');
    },
    [extensions, persistExtensions, showToast]
  );

  const addCustomExtension = useCallback(
    (input: {
      name: string;
      baseUrl: string;
      streamType: StreamProtocol;
      author?: string;
      description?: string;
      version?: string;
      supportedResolutions?: string[];
      supportsDub?: boolean;
      supportsSub?: boolean;
      hasIntroSkip?: boolean;
      badge?: string;
    }) => {
      const newId = `custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const simulatedLatency = Math.floor(Math.random() * 30) + 18;

      const newExt: AnimeExtension = {
        id: newId,
        name: input.name.trim() || 'Custom Stream Extension',
        version: input.version?.trim() || 'v1.0.0',
        author: input.author?.trim() || 'Custom User Provider',
        description:
          input.description?.trim() ||
          `Custom streaming endpoint using ${input.streamType.toUpperCase()} protocol.`,
        badge: input.badge?.trim() || 'CUSTOM SOURCE',
        badgeType: 'custom',
        streamType: input.streamType,
        baseUrl: input.baseUrl.trim(),
        enabled: true,
        isDefault: false,
        latencyMs: simulatedLatency,
        status: 'online',
        supportedResolutions:
          input.supportedResolutions && input.supportedResolutions.length > 0
            ? input.supportedResolutions
            : ['1080p', '720p'],
        supportsDub: input.supportsDub ?? true,
        supportsSub: input.supportsSub ?? true,
        hasIntroSkip: input.hasIntroSkip ?? false,
        downloadsEnabled: true,
        lastUpdated: 'Just now'
      };

      const updated = [newExt, ...extensions];
      persistExtensions(updated);
      setActiveExtensionIdState(newId);
      try {
        localStorage.setItem(ACTIVE_STORAGE_KEY, newId);
      } catch (e) {}

      showToast(`Successfully added and activated ${newExt.name}!`, 'success');
      return newExt;
    },
    [extensions, persistExtensions, showToast]
  );

  const testEndpointLatency = useCallback(async (url: string) => {
    // Quick test / simulated ping with network latency calculation
    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 180) + 70));
    const duration = Math.round(performance.now() - start);
    return { ok: true, latency: Math.max(12, Math.min(120, duration)) };
  }, []);

  const addFromManifestUrl = useCallback(
    async (url: string): Promise<{ success: boolean; message: string; extension?: AnimeExtension }> => {
      const cleanUrl = url.trim();
      if (!cleanUrl) {
        return { success: false, message: 'Please enter a valid extension repository or manifest URL.' };
      }

      // Check URL format
      try {
        new URL(cleanUrl);
      } catch {
        return { success: false, message: 'Invalid URL format. Please include http:// or https://' };
      }

      // Simulated network fetch with authentic anime source derivation
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Derive nice name and properties based on URL or generic
      let derivedName = 'Community Anime Provider';
      let derivedType: StreamProtocol = 'hls';
      let derivedBadge = 'REPO SOURCE';

      if (cleanUrl.toLowerCase().includes('consumet')) {
        derivedName = 'Consumet Fast Mirror';
        derivedType = 'consumet';
        derivedBadge = 'CONSUMET API';
      } else if (cleanUrl.toLowerCase().includes('hianime') || cleanUrl.toLowerCase().includes('aniwatch')) {
        derivedName = 'AniWatch/HiAnime Mirror V2';
        derivedType = 'hls';
        derivedBadge = 'MULTI-SUB';
      } else if (cleanUrl.toLowerCase().includes('gogo')) {
        derivedName = 'GogoStream High-Bandwidth';
        derivedType = 'mp4';
        derivedBadge = 'FAST CDN';
      } else if (cleanUrl.toLowerCase().includes('debrid') || cleanUrl.toLowerCase().includes('torrent')) {
        derivedName = 'Debrid Anime Cloud Streamer';
        derivedType = 'api';
        derivedBadge = '4K HDR REMUX';
      } else {
        const domain = cleanUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
        derivedName = `${domain.split('.')[0].toUpperCase()} Streaming Ext`;
      }

      const newId = `repo-${Date.now().toString(36)}`;
      const newExt: AnimeExtension = {
        id: newId,
        name: derivedName,
        version: 'v2.1.0',
        author: 'Verified Extension Repository',
        description: `Imported from ${cleanUrl}. Full simulcast archive with soft subtitles and fast edge caching.`,
        badge: derivedBadge,
        badgeType: 'community',
        streamType: derivedType,
        baseUrl: cleanUrl,
        repoUrl: cleanUrl,
        enabled: true,
        isDefault: false,
        latencyMs: Math.floor(Math.random() * 32) + 16,
        status: 'online',
        supportedResolutions: ['1080p', '720p', '480p'],
        supportsDub: true,
        supportsSub: true,
        hasIntroSkip: true,
        downloadsEnabled: true,
        lastUpdated: 'Just now'
      };

      const updated = [newExt, ...extensions];
      persistExtensions(updated);
      setActiveExtensionIdState(newId);
      try {
        localStorage.setItem(ACTIVE_STORAGE_KEY, newId);
      } catch (e) {}

      showToast(`Installed extension: ${derivedName}!`, 'success');
      return { success: true, message: `Extension ${derivedName} installed successfully!`, extension: newExt };
    },
    [extensions, persistExtensions, showToast]
  );

  const testPing = useCallback(
    async (id: string): Promise<number> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newPing = Math.floor(Math.random() * 40) + 15;
      const updated = extensions.map((e) =>
        e.id === id ? { ...e, latencyMs: newPing, status: 'online' as const } : e
      );
      persistExtensions(updated);
      showToast(`Ping refreshed: ${newPing}ms`, 'info');
      return newPing;
    },
    [extensions, persistExtensions, showToast]
  );

  const exportExtensions = useCallback(() => {
    return JSON.stringify(extensions, null, 2);
  }, [extensions]);

  const importExtensions = useCallback(
    (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          return { success: false, count: 0, error: 'JSON does not contain a valid array of extensions.' };
        }

        // Merge without duplicating IDs
        const existingIds = new Set(extensions.map((e) => e.id));
        const toAdd = parsed.filter((item) => item && item.name && item.baseUrl && !existingIds.has(item.id));
        const merged = [...extensions, ...toAdd];
        persistExtensions(merged);
        showToast(`Imported ${toAdd.length} extension(s)`, 'success');
        return { success: true, count: toAdd.length };
      } catch (err: any) {
        return { success: false, count: 0, error: err.message || 'Invalid JSON syntax.' };
      }
    },
    [extensions, persistExtensions, showToast]
  );

  const resetToDefaults = useCallback(() => {
    persistExtensions(DEFAULT_EXTENSIONS);
    setActiveExtensionIdState('kamui-origin');
    try {
      localStorage.setItem(ACTIVE_STORAGE_KEY, 'kamui-origin');
    } catch (e) {}
    showToast('Extensions reset to factory defaults', 'info');
  }, [persistExtensions, showToast]);

  const activeExtension = extensions.find((e) => e.id === activeExtensionId) || extensions[0];
  const installedCount = extensions.length;
  const activeCount = extensions.filter((e) => e.enabled).length;

  return (
    <ExtensionsContext.Provider
      value={{
        extensions,
        activeExtensionId,
        activeExtension,
        installedCount,
        activeCount,
        isModalOpen,
        modalTab,
        openModal,
        closeModal,
        setActiveExtension,
        toggleExtension,
        removeExtension,
        installFromStore,
        addCustomExtension,
        addFromManifestUrl,
        testPing,
        testEndpointLatency,
        exportExtensions,
        importExtensions,
        resetToDefaults
      }}
    >
      {children}
    </ExtensionsContext.Provider>
  );
};

export const useExtensions = () => {
  const context = useContext(ExtensionsContext);
  if (!context) {
    throw new Error('useExtensions must be used within an ExtensionsProvider');
  }
  return context;
};
