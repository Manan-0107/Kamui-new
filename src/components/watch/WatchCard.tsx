'use client';

import React from 'react';
import { AnimeData } from '@/lib/types';
import { AnimePosterSvg } from '@/components/visual/AnimePosterSvg';
import { usePlayback } from '@/context/PlaybackContext';

interface WatchCardProps {
  anime: AnimeData;
}

export const WatchCard: React.FC<WatchCardProps> = ({ anime }) => {
  const { openPreview } = usePlayback();

  return (
    <button
      type="button"
      className="watch-card"
      id={anime.id}
      data-genre={anime.genre}
      data-title={anime.title}
      data-genre-label={anime.genre}
      data-eps={anime.seasonsCount}
      data-synopsis={anime.synopsis}
      onClick={() => openPreview(anime.id)}
    >
      <AnimePosterSvg animeId={anime.id} className="art" />
      {anime.badge && <span className="watch-badge">{anime.badge}</span>}
      <span className="watch-card-meta">
        <span className="watch-card-title">{anime.title}</span>
        <span className="watch-card-genre">{anime.genre}</span>
      </span>
    </button>
  );
};
