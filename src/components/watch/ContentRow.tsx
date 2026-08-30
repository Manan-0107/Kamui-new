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
  const { openPreview, setHoveredCard } = usePlayback();

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
