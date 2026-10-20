'use client';

import React from 'react';

export interface PlayButtonProps {
  animeId: string;
  episodeNum?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  style?: React.CSSProperties;
}

/**
 * Global playability checker for titles and episodes.
 * Returns false currently (Step 1). In Step 2, this will check installed extensions
 * and stream resolvers to unlock playback in one single place.
 */
export function canPlay(_animeId?: string, _episodeNum?: number): boolean {
  return false;
}

/**
 * Centralized PlayButton component.
 * In Step 1, all buttons show a locked state ("Install an extension to watch").
 * In Step 2, updating canPlay() and this component unlocks playback across the entire app.
 */
export const PlayButton: React.FC<PlayButtonProps> = ({
  animeId,
  episodeNum,
  className = '',
  size = 'md',
  label = 'Play',
  style
}) => {
  const isPlayable = canPlay(animeId, episodeNum);

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5'
  };

  if (!isPlayable) {
    return (
      <button
        type="button"
        disabled
        title="Streaming is locked. Install an extension to watch."
        className={`inline-flex items-center justify-center font-medium rounded-md transition-all cursor-not-allowed opacity-60 bg-white/10 text-white/70 border border-white/15 select-none ${sizeClasses[size]} ${className}`}
        style={style}
        aria-label="Install an extension to watch"
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
          className="shrink-0"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Install an extension to watch</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-semibold rounded-md transition-all cursor-pointer bg-white text-black hover:bg-white/90 active:scale-95 ${sizeClasses[size]} ${className}`}
      style={style}
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
