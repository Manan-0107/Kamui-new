'use client';

import React, { useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { ANIME_CATALOG } from '@/lib/catalog';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';

interface ContentRowProps {
  id: string;
  kanji: string;
  title: string;
  countBadge?: number;
  animeIds: string[];
  onClear?: () => void;
  clearLabel?: string;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  id,
  kanji,
  title,
  countBadge,
  animeIds,
  onClear,
  clearLabel = 'Clear'
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { openPreview, playEpisode, toggleWatchlist, isInWatchlist } = usePlayback();

  if (animeIds.length === 0) return null;

  const handleScrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -750, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 750, behavior: 'smooth' });
    }
  };

  return (
    <section className="content-row-section" id={id} aria-label={title}>
      <div className="row-header">
        <div className="row-title-wrap">
          <span className="row-kanji-glyph">{kanji}</span>
          <h2 className="row-title">
            {title}
            {typeof countBadge === 'number' && (
              <span className="shelf-count-badge">{countBadge}</span>
            )}
          </h2>
        </div>
        <div className="row-header-right">
          <span
            className="row-explore-all"
            onClick={() => {
              const fullCat = document.getElementById('fullCatalogSection');
              if (fullCat) fullCat.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore All <span className="explore-chevron">›</span>
          </span>
          {onClear && (
            <button type="button" className="shelf-clear-btn" onClick={onClear} title={clearLabel}>
              {clearLabel}
            </button>
          )}
        </div>
      </div>

      <div className="row-track-wrapper">
        <button
          type="button"
          className="row-arrow row-arrow-left"
          aria-label="Scroll left"
          onClick={handleScrollLeft}
        >
          <span className="arrow-icon">‹</span>
        </button>

        <div ref={trackRef} className="row-track" id={`${id}-track`}>
          {animeIds.map((animeId) => {
            const anime = ANIME_CATALOG[animeId];
            if (!anime) return null;
            const inList = isInWatchlist(anime.id);

            return (
              <div
                key={anime.id}
                className="netflix-row-card"
                onClick={() => openPreview(anime.id)}
                role="button"
                tabIndex={0}
              >
                {/* Main Thumbnail & Badge */}
                <div className="card-thumb-wrap">
                  <AnimeArtSvg animeId={anime.id} className="row-card-art" />
                  <div className="row-card-gradient" />
                  {anime.badge && (
                    <span className={`row-card-badge ${anime.badgeType ? `badge-${anime.badgeType}` : ''}`}>
                      {anime.badge}
                    </span>
                  )}
                  <div className="card-static-title-wrap">
                    <span className="card-static-title">{anime.title}</span>
                  </div>
                </div>

                {/* Netflix Hover Micro-Popout Panel */}
                <div className="row-card-hover-panel">
                  {/* Top Media Artwork */}
                  <div className="hover-panel-media">
                    <AnimeArtSvg animeId={anime.id} className="hover-panel-art" />
                    <div className="hover-panel-gradient" />
                    {anime.badge && (
                      <span className="hover-panel-badge">{anime.badge}</span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="hover-panel-body">
                    {/* Action Buttons */}
                    <div className="row-card-actions">
                      <button
                        type="button"
                        className="row-card-play-btn"
                        title="Play Now"
                        onClick={(e) => {
                          e.stopPropagation();
                          playEpisode(anime.id, 1);
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className={`row-card-icon-btn ${inList ? 'active' : ''}`}
                        title={inList ? 'Remove from My List' : 'Add to My List'}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(anime.id);
                        }}
                      >
                        {inList ? (
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        )}
                      </button>

                      <button
                        type="button"
                        className="row-card-icon-btn row-card-chevron-btn"
                        title="Episode info & full details"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(anime.id);
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>

                    {/* Title & Metadata Line */}
                    <h3 className="row-card-title">{anime.title}</h3>

                    <div className="row-card-meta">
                      <span className="row-card-match">{anime.match}</span>
                      <span className="row-card-rating">{anime.rating}</span>
                      <span className="row-card-seasons">{anime.duration || anime.seasonsCount || '1 Season'}</span>
                      <span className="row-card-hd">4K HD</span>
                    </div>

                    {/* Genre Tags */}
                    <div className="row-card-genres">
                      {anime.genres.slice(0, 3).map((g) => (
                        <span key={g} className="row-card-genre-item">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="row-arrow row-arrow-right"
          aria-label="Scroll right"
          onClick={handleScrollRight}
        >
          <span className="arrow-icon">›</span>
        </button>
      </div>
    </section>
  );
};
