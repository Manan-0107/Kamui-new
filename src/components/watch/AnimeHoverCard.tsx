'use client';

import React from 'react';
import { AnimeData } from '@/lib/types';
import { usePlayback } from '@/context/PlaybackContext';
import { AnimeImagePreview } from '@/components/visual/AnimeImagePreview';
import { AnimeRatingBadges } from '@/components/watch/AnimeRatingBadges';
import { Puzzle } from 'lucide-react';

interface AnimeHoverCardProps {
  anime: AnimeData;
  onClose?: () => void;
}

export const AnimeHoverCard: React.FC<AnimeHoverCardProps> = ({ anime }) => {
  const { openPreview, toggleWatchlist, isInWatchlist, isLiked, toggleLike } = usePlayback();

  const inList = isInWatchlist(anime.id);
  const liked = isLiked(anime.id);

  return (
    <div
      className="netflix-hover-popout-card"
      onClick={(e) => {
        e.stopPropagation();
        openPreview(anime.id);
      }}
      role="dialog"
      aria-label={`${anime.title} preview`}
    >
      {/* Top Media Banner */}
      <div className="hover-popout-media">
        <div className="hover-popout-art-fallback" style={{ opacity: 1 }}>
          <AnimeImagePreview
            animeId={anime.id}
            src={anime.bannerImage || anime.posterImage}
            alt={anime.title}
            type="banner"
          />
        </div>
        <div className="hover-popout-gradient" />

        {/* Top Badges */}
        <div className="hover-popout-top-row">
          <span className="hover-popout-kanji-badge">
            {anime.kanji} {anime.badge ? `· ${anime.badge}` : ''}
          </span>
        </div>

        {/* Title inside Media */}
        <h3 className="hover-popout-title">{anime.title}</h3>
      </div>

      {/* Popout Body Content */}
      <div className="hover-popout-body">
        {/* Multi-Platform Ratings */}
        <div style={{ margin: '2px 0 10px' }}>
          <AnimeRatingBadges animeId={anime.id} title={anime.title} initialRatings={anime.ratings} compact={true} />
        </div>

        {/* Action Button Row */}
        <div className="hover-popout-actions">
          {/* Locked Play Button (Step 1 requirement) */}
          <button
            type="button"
            className="btn-hover-play-main disabled"
            disabled
            title="Install an extension to watch"
            style={{ opacity: 0.85, cursor: 'not-allowed' }}
          >
            <Puzzle size={16} />
            <span>Install extension to watch</span>
          </button>

          <button
            type="button"
            className={`hover-popout-circle-btn ${inList ? 'active' : ''}`}
            title={inList ? 'Remove from My List' : 'Add to My List'}
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(anime.id, anime.title);
            }}
          >
            {inList ? (
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className={`hover-popout-circle-btn ${liked ? 'active' : ''}`}
            title={liked ? 'Liked' : 'Like this anime'}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(anime.id, anime.title);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>

          <button
            type="button"
            className="hover-popout-circle-btn hover-popout-chevron"
            title="Expand Full Details"
            onClick={(e) => {
              e.stopPropagation();
              openPreview(anime.id);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Metadata Line */}
        <div className="hover-popout-meta-row">
          <span className="badge-match">{anime.match}</span>
          <span className="badge-rating">{anime.rating}</span>
          <span className="meta-seasons">{anime.duration || anime.seasonsCount}</span>
          <span style={{ fontSize: 11, color: '#02a9ff' }}>AniList</span>
        </div>

        <p className="hover-popout-synopsis">{anime.synopsis}</p>

        {/* Genres & Studio */}
        <div className="hover-popout-details-grid">
          {anime.genres && anime.genres.length > 0 && (
            <div className="hover-popout-detail">
              <span className="detail-label">GENRES:</span>
              <span className="detail-value">{anime.genres.join(', ')}</span>
            </div>
          )}
          {anime.studio && (
            <div className="hover-popout-detail">
              <span className="detail-label">STUDIO:</span>
              <span className="detail-value">{anime.studio}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
