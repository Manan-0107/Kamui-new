'use client';

import { useEffect, useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { initNativeHttpAdapter } from '@/lib/extensions';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * AndroidBridge component handles:
 * - Native HTTP adapter registration on Android
 * - Hardware Back Button event routing (closing player, modals, and sidebar)
 * - Application lifecycle (pausing video when app goes to background)
 */
export const AndroidBridge: React.FC = () => {
  const {
    isPlayerOpen,
    closePlayer,
    isPreviewOpen,
    closePreview,
    isSidebarOpen,
    closeSidebar
  } = usePlayback();

  // Keep latest state in refs for event listener callbacks
  const stateRef = useRef({
    isPlayerOpen,
    isPreviewOpen,
    isSidebarOpen
  });

  useEffect(() => {
    stateRef.current = {
      isPlayerOpen,
      isPreviewOpen,
      isSidebarOpen
    };
  }, [isPlayerOpen, isPreviewOpen, isSidebarOpen]);

  useEffect(() => {
    // Only register on native platforms (Android / iOS)
    if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) {
      return;
    }

    // 1. Initialize native extension HTTP transport
    initNativeHttpAdapter();

    // 2. Hardware Back Button Listener
    const backButtonHandler = App.addListener('backButton', ({ canGoBack }) => {
      const { isPlayerOpen, isPreviewOpen, isSidebarOpen } = stateRef.current;

      if (isPlayerOpen) {
        closePlayer();
        return;
      }

      if (isPreviewOpen) {
        closePreview();
        return;
      }

      if (isSidebarOpen) {
        closeSidebar();
        return;
      }

      if (window.location.pathname !== '/') {
        if (canGoBack) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
        return;
      }

      // At root with no modals open: exit application
      App.exitApp();
    });

    // 3. Application State Change (Lifecycle)
    const appStateHandler = App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        // App went to background: pause any active video playback
        const videos = document.querySelectorAll('video');
        videos.forEach((v) => {
          if (!v.paused) {
            v.pause();
          }
        });
      }
    });

    return () => {
      backButtonHandler.then((handle) => handle.remove()).catch(() => {});
      appStateHandler.then((handle) => handle.remove()).catch(() => {});
    };
  }, [closePlayer, closePreview, closeSidebar]);

  return null;
};
