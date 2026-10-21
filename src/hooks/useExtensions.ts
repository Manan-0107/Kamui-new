'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  InstalledExtension,
  ExtensionManifest,
  getStoredExtensions,
  installExtension as storeInstall,
  toggleExtensionEnabled as storeToggle,
  removeInstalledExtension as storeRemove,
  reorderExtensions as storeReorder,
  isNoticeAcknowledged,
  acknowledgeNotice,
  fetchManifest
} from '@/lib/extensions';

export function useExtensions() {
  const [extensions, setExtensions] = useState<InstalledExtension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAcknowledgedNotice, setHasAcknowledgedNotice] = useState(true);

  // Sync state from storage
  const refresh = useCallback(() => {
    const list = getStoredExtensions();
    setExtensions(list);
    setHasAcknowledgedNotice(isNoticeAcknowledged());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Listen for cross-tab or in-page storage changes
    const handleStorage = () => refresh();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refresh]);

  // Install extension by baseUrl
  const install = useCallback(
    async (baseUrl: string, preFetchedManifest?: ExtensionManifest) => {
      const manifest = preFetchedManifest || (await fetchManifest(baseUrl));
      const newExt = storeInstall(baseUrl, manifest);
      refresh();
      return newExt;
    },
    [refresh]
  );

  // Remove extension
  const remove = useCallback(
    (id: string) => {
      storeRemove(id);
      refresh();
    },
    [refresh]
  );

  // Toggle enable/disable
  const toggle = useCallback(
    (id: string) => {
      storeToggle(id);
      refresh();
    },
    [refresh]
  );

  // Reorder
  const reorder = useCallback(
    (sourceIdx: number, destIdx: number) => {
      storeReorder(sourceIdx, destIdx);
      refresh();
    },
    [refresh]
  );

  // Acknowledge notice
  const acknowledge = useCallback(() => {
    acknowledgeNotice();
    setHasAcknowledgedNotice(true);
  }, []);

  // Check health and manifest updates for an extension
  const checkHealth = useCallback(
    async (ext: InstalledExtension): Promise<{ ok: boolean; latency: number; error?: string }> => {
      const start = performance.now();
      try {
        const latest = await fetchManifest(ext.baseUrl);
        const latency = Math.round(performance.now() - start);

        // Update stored manifest if changed
        if (latest.version !== ext.manifest.version || latest.name !== ext.manifest.name) {
          storeInstall(ext.baseUrl, latest);
          refresh();
        }

        return { ok: true, latency };
      } catch (err: any) {
        return { ok: false, latency: Math.round(performance.now() - start), error: err.message };
      }
    },
    [refresh]
  );

  const enabledExtensions = useMemo(
    () => extensions.filter((e) => e.enabled),
    [extensions]
  );
  const hasEnabledExtensions = enabledExtensions.length > 0;

  return {
    extensions,
    enabledExtensions,
    hasEnabledExtensions,
    isLoading,
    hasAcknowledgedNotice,
    acknowledgeNotice: acknowledge,
    install,
    remove,
    toggle,
    reorder,
    checkHealth,
    refresh
  };
}
