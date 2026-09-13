'use client';

import React from 'react';
import { AnimeData } from '@/lib/types';
import { AnimeImagePreview } from '@/components/visual/AnimeImagePreview';
import { usePlayback } from '@/context/PlaybackContext';

interface WatchCardProps {
  anime: AnimeData;
}

export const WatchCard: React.FC<WatchCardProps> = ({ anime }) => {
  const { openPreview, getAnimeTrackerStatus } = usePlayback();
  const trackerStatus = getAnimeTrackerStatus(anime.id);

  const trackerLabelMap: Record<string, string> = {
    watching: 'Watching',
    planning: 'Plan to Watch',
    completed: 'Completed',
    on_hold: 'On Hold',
    dropped: 'Dropped'
  };

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
      <div className="watch-card-art-wrap">
        <AnimeImagePreview
          animeId={anime.id}
          src={anime.posterImage}
          alt={anime.title}
          type="poster"
          className="art"
        />
        {trackerStatus && (
          <span className={`watch-card-tracker-tag tag-${trackerStatus}`}>
            {trackerLabelMap[trackerStatus]}
          </span>
        )}
      </div>

      {anime.badge && <span className="watch-badge">{anime.badge}</span>}
      <span className="watch-card-meta">
        <span className="watch-card-title">{anime.title}</span>
        <span className="watch-card-genre">
          {anime.genre} {anime.ratings?.anilist ? `· AL ${anime.ratings.anilist.scoreFormatted}` : ''}
        </span>
      </span>
    </button>
  );
};
