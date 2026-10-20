'use client';

import React from 'react';
import Link from 'next/link';
import { useExtensions } from '@/hooks/useExtensions';
import { getStoredExtensions } from '@/lib/extensions';

export interface PlayButtonProps {
  animeId: string;
  episodeNum?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Global playability checker for titles and episodes.
 * Returns true if at least one extension is installed and enabled.
 */
export function canPlay(_animeId?: string, _episodeNum?: number): boolean {
  if (typeof window === 'undefined') return false;
  const list = getStoredExtensions();
  return list.some((ext) => ext.enabled);
}

/**
 * Centralized PlayButton component.
 * In Step 2:
 * - When at least one extension is enabled: returns playable state and calls onClick.
 * - When none are enabled: returns locked state linking directly to /extensions.
 */
export const PlayButton: React.FC<PlayButtonProps> = ({
  animeId: _animeId,
  episodeNum: _episodeNum,
  className = '',
  size = 'md',
  label = 'Play',
  style,
  onClick
}) => {
  const { hasEnabledExtensions } = useExtensions();
  const isPlayable = hasEnabledExtensions;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5'
  };

  if (!isPlayable) {
    return (
      <Link
        href="/extensions"
        title="Streaming is locked. Click to install an extension."
        className={`inline-flex items-center justify-center font-medium rounded-md transition-all cursor-pointer opacity-75 hover:opacity-100 bg-white/10 hover:bg-white/15 text-white/80 border border-white/15 select-none no-underline ${sizeClasses[size]} ${className}`}
        style={style}
        aria-label="Install an extension to watch"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-gold"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Install an extension to watch</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-semibold rounded-md transition-all cursor-pointer bg-white text-black hover:bg-white/90 active:scale-95 shadow-md ${sizeClasses[size]} ${className}`}
      style={style}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="currentColor"
        className="shrink-0"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <span>{label}</span>
    </button>
  );
};
