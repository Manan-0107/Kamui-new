'use client';

import React, { useRef } from 'react';
import { usePlayback } from '@/context/PlaybackContext';
import { ANIME_CATALOG } from '@/lib/catalog';
import { AnimeArtSvg } from '@/components/visual/AnimeArtSvg';
import { AnimeHoverCard } from './AnimeHoverCard';

interface ContentRowProps {
  id: string;
  kanji: string;
  title: string;
  countBadge?: number;
  animeIds: string[];
  onClear?: () => void;
  clearLabel?: string;
  emptyMessage?: string;
  alwaysShow?: boolean;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  id,
  kanji,
  title,
  countBadge,
  animeIds,
  onClear,
  clearLabel = 'Clear',
  emptyMessage,
  alwaysShow = false
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { openPreview, setHoveredCard } = usePlayback();

  if (animeIds.length === 0) {
    if (!alwaysShow) return null;
    return (
      <section className="content-row-section content-row-empty-section" id={id} aria-label={title}>
        <div className="row-header">
          <div className="row-title-wrap">
            <span className="row-kanji-glyph">{kanji}</span>
            <h2 className="row-title">
              {title}
              {typeof countBadge === 'number' && (
                <span className="shelf-count-badge">0</span>
              )}
            </h2>
          </div>
        </div>
        <div className="row-empty-card">
          <div className="row-empty-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </div>
          <div className="row-empty-text-wrap">
            <h4 className="row-empty-heading">No titles in {title.toLowerCase()} yet</h4>
            <p className="row-empty-desc">
              {emptyMessage || 'Click the 👍 like icon or add button on any anime card or modal to curate your list.'}
            </p>
          </div>
          <button
            type="button"
            className="row-empty-action-btn"
            onClick={() => {
              const fullCat = document.getElementById('fullCatalogSection');
              if (fullCat) fullCat.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Browse All Series →
          </button>
        </div>
      </section>
    );
  }

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

            return (
              <div
                key={anime.id}
                className="netflix-row-card"
                onClick={() => openPreview(anime.id)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredCard(anime.id, {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                  });
                }}
                onMouseLeave={() => setHoveredCard(null)}
                role="button"
                tabIndex={0}
              >
                {/* Main Static Thumbnail */}
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
